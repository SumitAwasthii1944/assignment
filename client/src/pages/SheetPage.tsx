import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTopicStore } from "../store/topic.store";
import { useSubTopicStore } from "../store/subTopic.store";
import { useQuestionStore } from "../store/question.store";
import { useDragReorder } from "../hooks/useDragReorder";
import { SheetHeader } from "../components/SheetHeader";
import { TopicSection } from "../components/TopicSection";
import { TopicFormModal } from "../components/TopicFormModal";
import { SubTopicFormModal } from "../components/SubTopicsFormModal";
import { QuestionFormModal } from "../components/QuestionFormModal";
import { ConfirmDialog } from "../components/confirmDialog";
import type { Topic } from "../api/topic.api";
import type { SubTopic } from "../api/subTopic.api";
import type { Question } from "../api/question.api";

interface SheetPageProps {
    sheetId: string;
    sheetTitle: string;
}

type DeleteTarget =
    | { kind: "topic"; item: Topic }
    | { kind: "subTopic"; item: SubTopic }
    | { kind: "question"; item: Question }
    | null;

export function SheetPage({ sheetId, sheetTitle }: SheetPageProps) {
    const topics = useTopicStore((s) => s.topics);
    const fetchTopics = useTopicStore((s) => s.fetchTopics);
    const createTopic = useTopicStore((s) => s.createTopic);
    const updateTopic = useTopicStore((s) => s.updateTopic);
    const removeTopic = useTopicStore((s) => s.removeTopic);
    const reorderTopic = useTopicStore((s) => s.reorder);

    const subTopics = useSubTopicStore((s) => s.subTopics);
    const fetchSubTopics = useSubTopicStore((s) => s.fetchSubTopics);
    const createSubTopic = useSubTopicStore((s) => s.createSubTopic);
    const updateSubTopic = useSubTopicStore((s) => s.updateSubTopic);
    const removeSubTopic = useSubTopicStore((s) => s.removeSubTopic);

    const questions = useQuestionStore((s) => s.questions);
    const setQuestions = useQuestionStore((s) => s.setQuestions);
    const createQuestion = useQuestionStore((s) => s.createQuestion);
    const updateQuestion = useQuestionStore((s) => s.updateQuestion);
    const removeQuestion = useQuestionStore((s) => s.removeQuestion);
    const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

    useEffect(() => {
        fetchTopics(sheetId);
        fetchSubTopics(sheetId);
        fetchQuestions(sheetId);
    }, [sheetId, fetchTopics, fetchSubTopics, fetchQuestions]);

    const [topicModal, setTopicModal] = useState<{ open: boolean; editing: Topic | null }>({
        open: false,
        editing: null,
    });
    const [subTopicModal, setSubTopicModal] = useState<{ open: boolean; topic: string; editing: SubTopic | null }>({
        open: false,
        topic: "",
        editing: null,
    });
    const [questionModal, setQuestionModal] = useState<{
        open: boolean;
        topic: string;
        subTopic: string | null;
        editing: Question | null;
    }>({ open: false, topic: "", subTopic: null, editing: null });
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopics(sheetId);
        fetchSubTopics(sheetId);
    }, [sheetId, fetchTopics, fetchSubTopics]);

    const solvedCount = questions.filter((q) => q.isSolved).length;
    const { handleDragEnd: handleTopicDragEnd } = useDragReorder(topics, reorderTopic);

    const questionsByTopic = useMemo(() => {
        const map = new Map<string, Question[]>();
        for (const q of questions) {
            const list = map.get(q.topic) ?? [];
            list.push(q);
            map.set(q.topic, list);
        }
        return map;
    }, [questions]);

    const subTopicsByTopic = useMemo(() => {
        const map = new Map<string, SubTopic[]>();
        for (const s of subTopics) {
            const list = map.get(s.topic) ?? [];
            list.push(s);
            map.set(s.topic, list);
        }
        return map;
    }, [subTopics]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteError(null);

        if (deleteTarget.kind === "topic") {
            const result = await removeTopic(deleteTarget.item._id);
            if (!result.ok) {
                setDeleteError(result.error ?? "Could not delete topic");
                return;
            }
        } else if (deleteTarget.kind === "subTopic") {
            const result = await removeSubTopic(deleteTarget.item._id);
            if (!result.ok) {
                setDeleteError(result.error ?? "Could not delete sub-topic");
                return;
            }
        } else if (deleteTarget.kind === "question") {
            await removeQuestion(deleteTarget.item._id);
        }

        setDeleteTarget(null);
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <SheetHeader
                title={sheetTitle}
                solvedCount={solvedCount}
                totalCount={questions.length}
                onAddTopic={() => setTopicModal({ open: true, editing: null })}
            />

            <DndContext collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
                <SortableContext items={topics.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                    {topics.map((topic) => (
                        <TopicSection
                            key={topic._id}
                            topic={topic}
                            subTopics={subTopicsByTopic.get(topic.name) ?? []}
                            questions={questionsByTopic.get(topic.name) ?? []}
                            onEditTopic={(t) => setTopicModal({ open: true, editing: t })}
                            onDeleteTopic={(t) => setDeleteTarget({ kind: "topic", item: t })}
                            onAddSubTopic={(topicName) => setSubTopicModal({ open: true, topic: topicName, editing: null })}
                            onEditSubTopic={(s) => setSubTopicModal({ open: true, topic: s.topic, editing: s })}
                            onDeleteSubTopic={(s) => setDeleteTarget({ kind: "subTopic", item: s })}
                            onAddQuestion={(topicName, subTopicName) =>
                                setQuestionModal({ open: true, topic: topicName, subTopic: subTopicName, editing: null })
                            }
                            onEditQuestion={(q) =>
                                setQuestionModal({ open: true, topic: q.topic, subTopic: q.subTopic, editing: q })
                            }
                            onDeleteQuestion={(q) => setDeleteTarget({ kind: "question", item: q })}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <TopicFormModal
                open={topicModal.open}
                initialName={topicModal.editing?.name ?? ""}
                onClose={() => setTopicModal({ open: false, editing: null })}
                onSubmit={async (name) => {
                    if (topicModal.editing) {
                        await updateTopic(topicModal.editing._id, { name });
                    } else {
                        await createTopic({ sheetId, name });
                    }
                }}
            />

            <SubTopicFormModal
                open={subTopicModal.open}
                initialName={subTopicModal.editing?.name ?? ""}
                onClose={() => setSubTopicModal({ open: false, topic: "", editing: null })}
                onSubmit={async (name) => {
                    if (subTopicModal.editing) {
                        await updateSubTopic(subTopicModal.editing._id, { name });
                    } else {
                        await createSubTopic(subTopicModal.topic, { sheetId, name });
                    }
                }}
            />

            <QuestionFormModal
                open={questionModal.open}
                topic={questionModal.topic}
                subTopic={questionModal.subTopic}
                sheetId={sheetId}
                initial={questionModal.editing}
                onClose={() => setQuestionModal({ open: false, topic: "", subTopic: null, editing: null })}
                onSubmit={async (values) => {
                    if (questionModal.editing) {
                        await updateQuestion(questionModal.editing._id, {
                            title: values.title,
                            resource: values.resource,
                            isPublic: values.isPublic,
                        });
                    } else {
                        const newQuestion = await createQuestion({
                            sheetId,
                            topic: questionModal.topic,
                            subTopic: questionModal.subTopic,
                            title: values.title,
                            resource: values.resource,
                            session: values.session,
                            isPublic: values.isPublic,
                            questionId: {
                                _id: crypto.randomUUID(),
                                id: crypto.randomUUID(),
                                name: values.title,
                                slug: values.title.toLowerCase().replace(/\s+/g, "-"),
                                platform: values.platform,
                                problemUrl: values.problemUrl,
                                difficulty: values.difficulty,
                                topics: [questionModal.topic],
                            },
                        });
                        if (newQuestion) setQuestions([...questions, newQuestion]);
                    }
                }}
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                title={`Delete ${deleteTarget?.kind === "topic" ? "topic" : deleteTarget?.kind === "subTopic" ? "sub-topic" : "question"}`}
                message={
                    deleteError ??
                    `This will permanently remove ${
                        deleteTarget?.kind === "question" ? "this question" : `"${(deleteTarget?.item as Topic | SubTopic)?.name}"`
                    }.`
                }
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteTarget(null);
                    setDeleteError(null);
                }}
            />
        </div>
    );
}