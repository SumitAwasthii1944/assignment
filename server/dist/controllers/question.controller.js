import { fetchCodolioSheet } from "../utils/codolio.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Question as QuestionModel } from "../models/question.model.js";
import { Topic as TopicModel } from "../models/topic.model.js";
import { SubTopic as SubTopicModel } from "../models/subTopic.model.js";
const buildQuestionHierarchy = (questions, sheet) => {
    const topicOrderMap = new Map(sheet.config.topicOrder.map((topic, index) => [topic, index]));
    const topics = new Map();
    for (const question of questions) {
        const sheetId = question.sheetId;
        const topicName = question.topic;
        const subTopicName = question.subTopic ?? "Uncategorized";
        const topic = topics.get(topicName) ?? {
            sheetId: sheetId,
            name: topicName,
            order: topicOrderMap.get(topicName) ?? Number.MAX_SAFE_INTEGER,
            subTopics: [],
        };
        let subTopic = topic.subTopics.find((item) => item.name === subTopicName);
        if (!subTopic) {
            const configuredSubTopics = sheet.config.subTopicOrder[topicName] ?? [];
            const configuredOrder = configuredSubTopics.indexOf(subTopicName);
            subTopic = {
                sheetId: sheetId,
                name: subTopicName,
                order: configuredOrder === -1 ? Number.MAX_SAFE_INTEGER : configuredOrder,
                questions: [],
            };
            topic.subTopics.push(subTopic);
        }
        subTopic.questions.push(question);
        topics.set(topicName, topic);
    }
    return [...topics.values()]
        .sort((first, second) => first.order - second.order)
        .map((topic) => ({
        ...topic,
        subTopics: topic.subTopics.sort((first, second) => first.order - second.order),
    }));
};
export const importCodolioQuestions = asyncHandler(async (_req, res) => {
    const codolioResponse = await fetchCodolioSheet();
    const questions = codolioResponse.data.questions;
    const { topicOrder, subTopicOrder, questionOrder } = codolioResponse.data.sheet.config;
    const questionOrderMap = new Map(questionOrder.map((questionId, index) => [questionId, index]));
    const topicNames = [
        ...new Set([...topicOrder, ...questions.map((question) => question.topic)]),
    ];
    const topicOperations = topicNames.map((name, order) => ({
        updateOne: {
            filter: {
                sheetId: codolioResponse.data.sheet._id,
                name,
            },
            update: { $set: { sheetId: codolioResponse.data.sheet._id, name, order } },
            upsert: true,
        },
    }));
    const subTopicNamesByTopic = new Map();
    for (const [topic, subTopics] of Object.entries(subTopicOrder)) {
        subTopicNamesByTopic.set(topic, [...subTopics]);
    }
    for (const question of questions) {
        if (question.subTopic !== null) {
            const subTopics = subTopicNamesByTopic.get(question.topic) ?? [];
            if (!subTopics.includes(question.subTopic)) {
                subTopics.push(question.subTopic);
            }
            subTopicNamesByTopic.set(question.topic, subTopics);
        }
    }
    const subTopicOperations = [...subTopicNamesByTopic.entries()].flatMap(([topic, subTopics]) => subTopics.map((name, order) => ({
        updateOne: {
            filter: {
                sheetId: codolioResponse.data.sheet._id,
                topic,
                name,
            },
            update: { $set: { sheetId: codolioResponse.data.sheet._id, topic, name, order } },
            upsert: true,
        },
    })));
    if (topicOperations.length > 0) {
        await TopicModel.bulkWrite(topicOperations);
    }
    if (subTopicOperations.length > 0) {
        await SubTopicModel.bulkWrite(subTopicOperations);
    }
    const operations = questions.map((question, index) => {
        const order = questionOrderMap.get(question._id) ?? index;
        return {
            updateOne: {
                filter: {
                    sheetId: question.sheetId,
                    "questionId._id": question.questionId._id,
                },
                update: {
                    $set: {
                        sheetId: question.sheetId,
                        questionId: question.questionId,
                        topic: question.topic,
                        title: question.title,
                        subTopic: question.subTopic,
                        resource: question.resource,
                        session: question.session,
                        isPublic: question.isPublic,
                        isSolved: question.isSolved,
                        questionDocumentId: question.questionDocumentId,
                        order,
                    },
                },
                upsert: true,
            },
        };
    });
    if (operations.length > 0) {
        await QuestionModel.bulkWrite(operations);
    }
    await QuestionModel.deleteMany({
        sheetId: codolioResponse.data.sheet._id,
        "questionId._id": { $nin: questions.map((question) => question.questionId._id) },
    });
    const savedQuestions = await QuestionModel.find({
        sheetId: codolioResponse.data.sheet._id,
    }).sort({ order: 1 });
    const [savedTopics, savedSubTopics] = await Promise.all([
        TopicModel.find({ sheetId: codolioResponse.data.sheet._id }).select("_id name").lean(),
        SubTopicModel.find({ sheetId: codolioResponse.data.sheet._id }).select("_id name topic").lean(),
    ]);
    const hierarchy = buildQuestionHierarchy(savedQuestions.map((question) => question.toObject()), codolioResponse.data.sheet);
    const hierarchyWithIds = hierarchy.map((topic) => ({
        ...topic,
        _id: savedTopics.find((item) => item.name === topic.name)?._id.toString(),
        subTopics: topic.subTopics.map((subTopic) => ({
            ...subTopic,
            _id: savedSubTopics.find((item) => item.topic === topic.name && item.name === subTopic.name)?._id.toString(),
        })),
    }));
    return res
        .status(200)
        .json(new ApiResponse(200, {
        sheet: codolioResponse.data.sheet,
        topics: hierarchyWithIds,
    }, "Codolio questions imported successfully"));
});
export const addQuestion = asyncHandler(async (req, res) => {
    const { questionId, sheetId, topic, title, subTopic, resource, session, isPublic, } = req.body;
    if (!questionId?._id || !sheetId || !title || !topic || !session) {
        return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
    }
    const topicExists = await TopicModel.exists({ sheetId, name: topic });
    if (!topicExists) {
        return res.status(400).json(new ApiResponse(400, null, "Topic does not belong to this sheet"));
    }
    if (subTopic !== null && subTopic !== undefined) {
        const subTopicExists = await SubTopicModel.exists({
            sheetId,
            topic,
            name: subTopic,
        });
        if (!subTopicExists) {
            return res.status(400).json(new ApiResponse(400, null, "Subtopic does not belong to this topic"));
        }
    }
    const lastQuestion = await QuestionModel.findOne({ sheetId }).sort({ order: -1 });
    const order = lastQuestion ? lastQuestion.order + 1 : 0;
    const newQuestion = await QuestionModel.create({
        questionId,
        sheetId,
        topic,
        title,
        subTopic: subTopic ?? null,
        resource,
        session,
        isPublic: isPublic ?? true,
        isSolved: false,
        questionDocumentId: null,
        order,
    });
    return res
        .status(201)
        .json(new ApiResponse(201, newQuestion, "Question added successfully"));
});
export const getQuestion = asyncHandler(async (req, res) => {
    const question = await QuestionModel.findById(req.params.id);
    if (!question) {
        return res.status(404).json(new ApiResponse(404, null, "Question not found"));
    }
    return res.status(200).json(new ApiResponse(200, question, "Question fetched successfully"));
});
export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "Question id is required"));
    }
    const deletedQuestion = await QuestionModel.findByIdAndDelete(id);
    if (!deletedQuestion) {
        return res.status(404).json(new ApiResponse(404, null, "Question not found"));
    }
    const remainingQuestions = await QuestionModel.find({
        sheetId: deletedQuestion.sheetId,
    }).sort({ order: 1 });
    if (remainingQuestions.length > 0) {
        await QuestionModel.bulkWrite(remainingQuestions.map((question, order) => ({
            updateOne: {
                filter: { _id: question._id },
                update: { $set: { order } },
            },
        })));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deletedQuestion, "Question deleted successfully"));
});
export const editQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { topic, title, subTopic, resource, session, isPublic, isSolved, } = req.body;
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "Question id is required"));
    }
    const existingQuestion = await QuestionModel.findById(id);
    if (!existingQuestion) {
        return res.status(404).json(new ApiResponse(404, null, "Question not found"));
    }
    const updatedTopic = topic ?? existingQuestion.topic;
    const updatedSubTopic = subTopic !== undefined
        ? subTopic
        : existingQuestion.subTopic;
    if (!(await TopicModel.exists({
        sheetId: existingQuestion.sheetId,
        name: updatedTopic,
    }))) {
        return res.status(400).json(new ApiResponse(400, null, "Topic does not belong to this sheet"));
    }
    if (updatedSubTopic !== null && !(await SubTopicModel.exists({
        sheetId: existingQuestion.sheetId,
        topic: updatedTopic,
        name: updatedSubTopic,
    }))) {
        return res.status(400).json(new ApiResponse(400, null, "Subtopic does not belong to this topic"));
    }
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(id, {
        $set: {
            ...(topic !== undefined && { topic }),
            ...(title !== undefined && { title }),
            ...(subTopic !== undefined && { subTopic }),
            ...(resource !== undefined && { resource }),
            ...(session !== undefined && { session }),
            ...(isPublic !== undefined && { isPublic }),
            ...(isSolved !== undefined && { isSolved }),
        },
    }, { new: true, runValidators: true });
    if (!updatedQuestion) {
        return res.status(404).json(new ApiResponse(404, null, "Question not found"));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedQuestion, "Question updated successfully"));
});
export const reorderQuestion = asyncHandler(async (req, res) => {
    const { id, prevId, nextId } = req.body;
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "id is required"));
    }
    const question = await QuestionModel.findById(id);
    if (!question) {
        return res.status(404).json(new ApiResponse(404, null, "Question not found"));
    }
    const questions = await QuestionModel.find({
        sheetId: question.sheetId,
        topic: question.topic,
        subTopic: question.subTopic,
    }).sort({ order: 1, _id: 1 });
    const remainingQuestions = questions.filter((item) => item._id.toString() !== id);
    const targetIndex = nextId
        ? remainingQuestions.findIndex((item) => item._id.toString() === nextId)
        : prevId
            ? remainingQuestions.findIndex((item) => item._id.toString() === prevId) + 1
            : remainingQuestions.length;
    if ((nextId && targetIndex === -1) || (prevId && targetIndex === 0)) {
        return res.status(400).json(new ApiResponse(400, null, "Neighbor question not found"));
    }
    remainingQuestions.splice(targetIndex, 0, question);
    await QuestionModel.bulkWrite(remainingQuestions.map((item, order) => ({
        updateOne: {
            filter: { _id: item._id },
            update: { $set: { order } },
        },
    })));
    return res.status(200).json(new ApiResponse(200, { id, order: targetIndex }, "Question reordered successfully"));
});
//# sourceMappingURL=question.controller.js.map