import { create } from "zustand";
import {
    addTopic,
    getTopics,
    editTopic,
    deleteTopic,
    reorderTopic,
    type Topic,
    type AddTopicPayload,
    type EditTopicPayload,
} from "../api/topic.api";
import type { ReorderPayload } from "../api/question.api";
import { extractErrorMessage } from "../lib/erros";

interface TopicState {
    topics: Topic[];
    loading: boolean;
    error: string | null;
    fetchTopics: (sheetId: string) => Promise<void>;
    createTopic: (payload: AddTopicPayload) => Promise<Topic | null>;
    updateTopic: (id: string, payload: EditTopicPayload) => Promise<Topic | null>;
    removeTopic: (id: string) => Promise<{ ok: boolean; error?: string }>;
    reorder: (payload: ReorderPayload) => Promise<boolean>;
}

const sortByOrder = (items: Topic[]) => [...items].sort((a, b) => a.order - b.order);

export const useTopicStore = create<TopicState>((set, get) => ({
    topics: [],
    loading: false,
    error: null,

    fetchTopics: async (sheetId) => {
        set({ loading: true, error: null });
        try {
            const topics = await getTopics(sheetId);
            set({ topics: sortByOrder(topics), loading: false });
        } catch (err) {
            set({ error: extractErrorMessage(err), loading: false });
        }
    },

    createTopic: async (payload) => {
        try {
            const topic = await addTopic(payload);
            set((state) => ({ topics: sortByOrder([...state.topics, topic]) }));
            return topic;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return null;
        }
    },

    updateTopic: async (id, payload) => {
        try {
            const updated = await editTopic(id, payload);
            set((state) => ({
                topics: sortByOrder(state.topics.map((t) => (t._id === id ? updated : t))),
            }));
            return updated;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return null;
        }
    },

    removeTopic: async (id) => {
        try {
            await deleteTopic(id);
            set((state) => ({ topics: state.topics.filter((t) => t._id !== id) }));
            return { ok: true };
        } catch (err) {
            const message = extractErrorMessage(err);
            set({ error: message });
            return { ok: false, error: message };
        }
    },

    reorder: async (payload) => {
        const prevTopics = get().topics;
        const { id, prevId, nextId } = payload;
        const moving = prevTopics.find((t) => t._id === id);
        if (!moving) return false;

        const remaining = prevTopics.filter((t) => t._id !== id);
        const targetIndex = nextId
            ? remaining.findIndex((t) => t._id === nextId)
            : prevId
                ? remaining.findIndex((t) => t._id === prevId) + 1
                : remaining.length;

        if (targetIndex === -1) return false;
        remaining.splice(targetIndex, 0, moving);
        set({ topics: remaining.map((t, order) => ({ ...t, order })) });

        try {
            await reorderTopic(payload);
            return true;
        } catch (err) {
            set({ topics: prevTopics, error: extractErrorMessage(err) });
            return false;
        }
    },
}));