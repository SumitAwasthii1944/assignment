import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question } from "../api/question.api";
import type { SubTopic } from "../api/subTopic.api";
import { QuestionRow } from "./QuestionRow";
import { useDragReorder } from "../hooks/useDragReorder";
import { useQuestionStore } from "../store/question.store";

interface SubTopicGroupProps {
    subTopic: SubTopic;
    questions: Question[];
    onEditSubTopic: (subTopic: SubTopic) => void;
    onDeleteSubTopic: (subTopic: SubTopic) => void;
    onAddQuestion: (topic: string, subTopic: string) => void;
    onEditQuestion: (question: Question) => void;
    onDeleteQuestion: (question: Question) => void;
}

export function SubTopicGroup({
    subTopic,
    questions,
    onEditSubTopic,
    onDeleteSubTopic,
    onAddQuestion,
    onEditQuestion,
    onDeleteQuestion,
}: SubTopicGroupProps) {
    const [expanded, setExpanded] = useState(true);
    const reorderQuestion = useQuestionStore((s) => s.reorder);
    const updateQuestion = useQuestionStore((s) => s.updateQuestion);
    const { handleDragEnd } = useDragReorder(questions, reorderQuestion);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subTopic._id });

    const style = { transform: CSS.Transform.toString(transform), transition };
    const solvedCount = questions.filter((q) => q.isSolved).length;

    return (
        <div ref={setNodeRef} style={style} className="ml-6 border-l border-slate-200 pl-3">
            <div className="group flex items-center gap-2 py-2">
                <button {...attributes} {...listeners} className="cursor-grab text-slate-300 opacity-0 group-hover:opacity-100">
                    ⠿
                </button>
                <button onClick={() => setExpanded((v) => !v)} className="text-xs text-slate-400">
                    {expanded ? "▾" : "▸"}
                </button>
                <span className="text-sm font-medium text-slate-700">{subTopic.name}</span>
                <span className="text-xs text-slate-400">{solvedCount} / {questions.length}</span>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onAddQuestion(subTopic.topic, subTopic.name)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                        + Question
                    </button>
                    <button onClick={() => onEditSubTopic(subTopic)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                        Edit
                    </button>
                    <button onClick={() => onDeleteSubTopic(subTopic)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                        Delete
                    </button>
                </div>
            </div>
            {expanded && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map((q) => q._id)} strategy={verticalListSortingStrategy}>
                        <div className="overflow-hidden rounded-md border border-slate-100">
                            {questions.map((q) => (
                                <QuestionRow
                                    key={q._id}
                                    question={q}
                                    onToggleSolved={(id, isSolved) => updateQuestion(id, { isSolved })}
                                    onEdit={onEditQuestion}
                                    onDelete={onDeleteQuestion}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}