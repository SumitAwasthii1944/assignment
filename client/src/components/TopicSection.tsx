import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Topic } from "../api/topic.api";
import type { SubTopic } from "../api/subTopic.api";
import type { Question } from "../api/question.api";
import { QuestionRow } from "./QuestionRow";
import { SubTopicGroup } from "./SubTopicGroup";
import { useDragReorder } from "../hooks/useDragReorder";
import { useQuestionStore } from "../store/question.store";
import { useSubTopicStore } from "../store/subTopic.store";

interface TopicSectionProps {
    topic: Topic;
    subTopics: SubTopic[];
    questions: Question[];
    onEditTopic: (topic: Topic) => void;
    onDeleteTopic: (topic: Topic) => void;
    onAddSubTopic: (topic: string) => void;
    onEditSubTopic: (subTopic: SubTopic) => void;
    onDeleteSubTopic: (subTopic: SubTopic) => void;
    onAddQuestion: (topic: string, subTopic: string | null) => void;
    onEditQuestion: (question: Question) => void;
    onDeleteQuestion: (question: Question) => void;
}

export function TopicSection({
    topic,
    subTopics,
    questions,
    onEditTopic,
    onDeleteTopic,
    onAddSubTopic,
    onEditSubTopic,
    onDeleteSubTopic,
    onAddQuestion,
    onEditQuestion,
    onDeleteQuestion,
}: TopicSectionProps) {
    const [expanded, setExpanded] = useState(true);
    const reorderQuestion = useQuestionStore((s) => s.reorder);
    const reorderSubTopic = useSubTopicStore((s) => s.reorder);
    const updateQuestion = useQuestionStore((s) => s.updateQuestion);

    const ungroupedQuestions = questions.filter((q) => q.subTopic === null);
    const { handleDragEnd: handleUngroupedDragEnd } = useDragReorder(ungroupedQuestions, reorderQuestion);
    const { handleDragEnd: handleSubTopicDragEnd } = useDragReorder(subTopics, reorderSubTopic);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: topic._id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const solvedCount = questions.filter((q) => q.isSolved).length;

    return (
        <div ref={setNodeRef} style={style} className="mb-4 rounded-lg border border-slate-200 bg-white">
            <div className="group flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                <button {...attributes} {...listeners} className="cursor-grab text-slate-300 opacity-0 group-hover:opacity-100">
                    ⠿
                </button>
                <button onClick={() => setExpanded((v) => !v)} className="text-slate-400">
                    {expanded ? "▾" : "▸"}
                </button>
                <h3 className="text-sm font-semibold text-slate-900">{topic.name}</h3>
                <span className="text-xs text-slate-400">{solvedCount} / {questions.length}</span>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onAddSubTopic(topic.name)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                        + Sub-topic
                    </button>
                    <button onClick={() => onAddQuestion(topic.name, null)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                        + Question
                    </button>
                    <button onClick={() => onEditTopic(topic)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                        Edit
                    </button>
                    <button onClick={() => onDeleteTopic(topic)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                        Delete
                    </button>
                </div>
            </div>
            {expanded && (
                <div className="py-2">
                    {ungroupedQuestions.length > 0 && (
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleUngroupedDragEnd}>
                            <SortableContext items={ungroupedQuestions.map((q) => q._id)} strategy={verticalListSortingStrategy}>
                                <div className="mx-4 overflow-hidden rounded-md border border-slate-100">
                                    {ungroupedQuestions.map((q) => (
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
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleSubTopicDragEnd}>
                        <SortableContext items={subTopics.map((s) => s._id)} strategy={verticalListSortingStrategy}>
                            {subTopics.map((subTopic) => (
                                <SubTopicGroup
                                    key={subTopic._id}
                                    subTopic={subTopic}
                                    questions={questions.filter((q) => q.subTopic === subTopic.name)}
                                    onEditSubTopic={onEditSubTopic}
                                    onDeleteSubTopic={onDeleteSubTopic}
                                    onAddQuestion={onAddQuestion}
                                    onEditQuestion={onEditQuestion}
                                    onDeleteQuestion={onDeleteQuestion}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}