import { create } from "zustand";
import {
    addSubTopic,
    getSubTopics,
    editSubTopic,
    deleteSubTopic,
    reorderSubTopic,
    type SubTopic,
    type AddSubTopicPayload,
    type EditSubTopicPayload,
} from "../api/subTopic.api";
import type { ReorderPayload } from "../api/question.api";
import { extractErrorMessage } from "../lib/erros";

interface SubTopicState {
    subTopics: SubTopic[];
    loading: boolean;
    error: string | null;
    fetchSubTopics: (sheetId: string) => Promise<void>;
    createSubTopic: (topic: string, payload: AddSubTopicPayload) => Promise<SubTopic | null>;
    updateSubTopic: (id: string, payload: EditSubTopicPayload) => Promise<SubTopic | null>;
    removeSubTopic: (id: string) => Promise<{ ok: boolean; error?: string }>;
    reorder: (payload: ReorderPayload) => Promise<boolean>;
}

const sortByOrder = (items: SubTopic[]) => [...items].sort((a, b) => a.order - b.order);

export const useSubTopicStore = create<SubTopicState>((set, get) => ({
    subTopics: [],
    loading: false,
    error: null,

    fetchSubTopics: async (sheetId) => {
        set({ loading: true, error: null });
        try {
            const subTopics = await getSubTopics(sheetId);
            set({ subTopics: sortByOrder(subTopics), loading: false });
        } catch (err) {
            set({ error: extractErrorMessage(err), loading: false });
        }
    },

    createSubTopic: async (topic, payload) => {
        set({ loading: true, error: null });
        try {
            const subTopic = await addSubTopic(topic, payload);
            set((state) => ({
                subTopics: sortByOrder([...state.subTopics, subTopic]),
                loading: false,
            }));
            return subTopic;
        } catch (err) {
            set({ error: extractErrorMessage(err), loading: false });
            return null;
        }
    },

    updateSubTopic: async (id, payload) => {
        try {
            const updated = await editSubTopic(id, payload);
            set((state) => ({
                subTopics: sortByOrder(state.subTopics.map((s) => (s._id === id ? updated : s))),
            }));
            return updated;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return null;
        }
    },

    removeSubTopic: async (id) => {
        try {
            await deleteSubTopic(id);
            set((state) => ({ subTopics: state.subTopics.filter((s) => s._id !== id) }));
            return { ok: true };
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ error: message });
            return { ok: false, error: message };
        }
    },

    reorder: async (payload) => {
        const prevSubTopics = get().subTopics;
        const { id, prevId, nextId } = payload;
        const moving = prevSubTopics.find((s) => s._id === id);
        if (!moving) return false;

        const siblings = prevSubTopics.filter((s) => s.topic === moving.topic && s._id !== id);
        const others = prevSubTopics.filter((s) => s.topic !== moving.topic);
        const targetIndex = nextId
            ? siblings.findIndex((s) => s._id === nextId)
            : prevId
                ? siblings.findIndex((s) => s._id === prevId) + 1
                : siblings.length;

        if (targetIndex === -1) return false;
        siblings.splice(targetIndex, 0, moving);
        const reOrdered = siblings.map((s, order) => ({ ...s, order }));
        set({ subTopics: sortByOrder([...others, ...reOrdered]) });

        try {
            await reorderSubTopic(payload);
            return true;
        } catch (err) {
            set({ subTopics: prevSubTopics, error: extractErrorMessage(err) });
            return false;
        }
    },
}));