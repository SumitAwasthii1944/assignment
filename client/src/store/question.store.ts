import { create } from "zustand";
import {
    getQuestions,
    addQuestion,
    editQuestion,
    deleteQuestion,
    reorderQuestion,
    type Question,
    type AddQuestionPayload,
    type EditQuestionPayload,
    type ReorderPayload,
} from "../api/question.api";
import { extractErrorMessage } from "../lib/erros";

interface QuestionState {
    questions: Question[];
    loading: boolean;
    error: string | null;
    setQuestions: (questions: Question[]) => void;
    fetchQuestions: (sheetId: string) => Promise<void>;
    createQuestion: (payload: AddQuestionPayload) => Promise<Question | null>;
    updateQuestion: (id: string, payload: EditQuestionPayload) => Promise<Question | null>;
    removeQuestion: (id: string) => Promise<boolean>;
    reorder: (payload: ReorderPayload) => Promise<boolean>;
}

const sortByOrder = (items: Question[]) => [...items].sort((a, b) => a.order - b.order);
const groupKey = (q: Question) => `${q.sheetId}|${q.topic}|${q.subTopic ?? ""}`;

export const useQuestionStore = create<QuestionState>((set, get) => ({
    questions: [],
    loading: false,
    error: null,

    setQuestions: (questions) => set({ questions: sortByOrder(questions) }),

    fetchQuestions: async (sheetId) => {
        set({ loading: true, error: null });
        try {
            const questions = await getQuestions(sheetId);
            set({ questions: sortByOrder(questions), loading: false });
        } catch (err) {
            set({ error: extractErrorMessage(err), loading: false });
        }
    },

    createQuestion: async (payload) => {
        try {
            const question = await addQuestion(payload);
            set((state) => ({ questions: sortByOrder([...state.questions, question]) }));
            return question;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return null;
        }
    },

    updateQuestion: async (id, payload) => {
        try {
            const updated = await editQuestion(id, payload);
            set((state) => ({
                questions: sortByOrder(state.questions.map((q) => (q._id === id ? updated : q))),
            }));
            return updated;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return null;
        }
    },

    removeQuestion: async (id) => {
        try {
            await deleteQuestion(id);
            set((state) => ({ questions: state.questions.filter((q) => q._id !== id) }));
            return true;
        } catch (err) {
            set({ error: extractErrorMessage(err) });
            return false;
        }
    },

    reorder: async (payload) => {
        const prevQuestions = get().questions;
        const { id, prevId, nextId } = payload;
        const moving = prevQuestions.find((q) => q._id === id);
        if (!moving) return false;

        const key = groupKey(moving);
        const siblings = prevQuestions.filter((q) => groupKey(q) === key && q._id !== id);
        const others = prevQuestions.filter((q) => groupKey(q) !== key);
        const targetIndex = nextId
            ? siblings.findIndex((q) => q._id === nextId)
            : prevId
                ? siblings.findIndex((q) => q._id === prevId) + 1
                : siblings.length;

        if (targetIndex === -1) return false;
        siblings.splice(targetIndex, 0, moving);
        const reOrdered = siblings.map((q, order) => ({ ...q, order }));
        set({ questions: sortByOrder([...others, ...reOrdered]) });

        try {
            await reorderQuestion(payload);
            return true;
        } catch (err) {
            set({ questions: prevQuestions, error: extractErrorMessage(err) });
            return false;
        }
    },
}));