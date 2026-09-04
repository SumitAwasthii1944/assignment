import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question } from "../api/question.api";
import { DifficultyBadge } from "./DifficultyBadge";

interface QuestionRowProps {
    question: Question;
    onToggleSolved: (id: string, isSolved: boolean) => void;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
}

export function QuestionRow({ question, onToggleSolved, onEdit, onDelete }: QuestionRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const resourceLink = question.resource ? (
        <a
            href={question.resource}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-red-50 px-1.5 py-1 text-xs text-red-600 hover:bg-red-100"
        >
            link
        </a>
    ) : null;

    const problemLink = (
        <a
            href={question.questionId.problemUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600"
        >
            problem
        </a>
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-300 opacity-0 group-hover:opacity-100"
                aria-label="Drag to reorder"
            >
                ⠿
            </button>
            <input
                type="checkbox"
                checked={question.isSolved}
                onChange={() => onToggleSolved(question._id, !question.isSolved)}
                className="h-4 w-4 rounded-full accent-emerald-500"
            />
            <span className="flex-1 truncate text-sm text-slate-800">{question.title}</span>
            <DifficultyBadge difficulty={question.questionId.difficulty} />
            {resourceLink}
            {problemLink}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={() => onEdit(question)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">
                    Edit
                </button>
                <button onClick={() => onDelete(question)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                    Delete
                </button>
            </div>
        </div>
    );
}