import { useEffect, useState } from "react";
import { Modal } from "./Modal";

interface TopicFormModalProps {
    open: boolean;
    initialName?: string;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

export function TopicFormModal({ open, initialName = "", onClose, onSubmit }: TopicFormModalProps) {
    const [name, setName] = useState(initialName);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName, open]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        await onSubmit(name.trim());
        setSubmitting(false);
        onClose();
    };

    return (
        <Modal open={open} title={initialName ? "Edit topic" : "Add topic"} onClose={onClose}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Topic name</label>
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Arrays Part-IV"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <div className="mt-5 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !name.trim()}
                    className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    {initialName ? "Save changes" : "Add topic"}
                </button>
            </div>
        </Modal>
    );
}