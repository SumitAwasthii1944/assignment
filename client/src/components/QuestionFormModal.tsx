import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { Question } from "../api/question.api";

interface QuestionFormValues {
    title: string;
    difficulty: string;
    problemUrl: string;
    resource: string;
    platform: string;
    session: string;
    isPublic: boolean;
}

interface QuestionFormModalProps {
    open: boolean;
    topic: string;
    subTopic: string | null;
    sheetId: string;
    initial?: Question | null;
    onClose: () => void;
    onSubmit: (values: QuestionFormValues) => Promise<void>;
}

const emptyForm: QuestionFormValues = {
    title: "",
    difficulty: "Medium",
    problemUrl: "",
    resource: "",
    platform: "leetcode",
    session: "manual",
    isPublic: true,
};

export function QuestionFormModal({ open, topic, subTopic, initial, onClose, onSubmit }: QuestionFormModalProps) {
    const [form, setForm] = useState<QuestionFormValues>(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initial) {
            setForm({
                title: initial.title,
                difficulty: initial.questionId.difficulty,
                problemUrl: initial.questionId.problemUrl,
                resource: initial.resource ?? "",
                platform: initial.questionId.platform,
                session: initial.session,
                isPublic: initial.isPublic,
            });
        } else {
            setForm(emptyForm);
        }
    }, [initial, open]);

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setSubmitting(true);
        await onSubmit(form);
        setSubmitting(false);
        onClose();
    };

    return (
        <Modal open={open} title={initial ? "Edit question" : `Add question to ${subTopic ?? topic}`} onClose={onClose}>
            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                    <input
                        autoFocus
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
                        <select
                            value={form.difficulty}
                            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Platform</label>
                        <input
                            value={form.platform}
                            onChange={(e) => setForm({ ...form, platform: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Problem URL</label>
                    <input
                        value={form.problemUrl}
                        onChange={(e) => setForm({ ...form, problemUrl: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Video resource (optional)</label>
                    <input
                        value={form.resource}
                        onChange={(e) => setForm({ ...form, resource: e.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={form.isPublic}
                        onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    />
                    Public
                </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.title.trim()}
                    className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    {initial ? "Save changes" : "Add question"}
                </button>
            </div>
        </Modal>
    );
}