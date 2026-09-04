import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Topic as TopicModel } from "../models/topic.model.js";
import { SubTopic as SubTopicModel } from "../models/subTopic.model.js";
import { Question as QuestionModel } from "../models/question.model.js";
const getSheetId = (req) => {
    const { sheetId } = req.body;
    return typeof sheetId === "string" && sheetId.trim() ? sheetId.trim() : null;
};
export const addTopic = asyncHandler(async (req, res) => {
    const sheetId = getSheetId(req);
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!sheetId || !name) {
        return res.status(400).json(new ApiResponse(400, null, "sheetId and name are required"));
    }
    const lastTopic = await TopicModel.findOne({ sheetId }).sort({ order: -1 });
    const topic = await TopicModel.create({
        sheetId,
        name,
        order: lastTopic ? lastTopic.order + 1 : 0,
    });
    return res.status(201).json(new ApiResponse(201, topic, "Topic added successfully"));
});
export const getTopics = asyncHandler(async (req, res) => {
    const sheetId = typeof req.query.sheetId === "string" ? req.query.sheetId.trim() : "";
    if (!sheetId) {
        return res.status(400).json(new ApiResponse(400, null, "sheetId is required"));
    }
    const topics = await TopicModel.find({ sheetId }).sort({ order: 1, name: 1 });
    return res.status(200).json(new ApiResponse(200, topics, "Topics fetched successfully"));
});
export const getTopic = asyncHandler(async (req, res) => {
    const topic = await TopicModel.findById(req.params.id);
    if (!topic) {
        return res.status(404).json(new ApiResponse(404, null, "Topic not found"));
    }
    return res.status(200).json(new ApiResponse(200, topic, "Topic fetched successfully"));
});
export const editTopic = asyncHandler(async (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const topic = await TopicModel.findById(req.params.id);
    if (!topic) {
        return res.status(404).json(new ApiResponse(404, null, "Topic not found"));
    }
    if (!name) {
        return res.status(400).json(new ApiResponse(400, null, "name is required"));
    }
    if (name !== topic.name) {
        await QuestionModel.updateMany({ sheetId: topic.sheetId, topic: topic.name }, { $set: { topic: name } });
        await SubTopicModel.updateMany({ sheetId: topic.sheetId, topic: topic.name }, { $set: { topic: name } });
    }
    topic.name = name;
    await topic.save();
    return res.status(200).json(new ApiResponse(200, topic, "Topic updated successfully"));
});
export const deleteTopic = asyncHandler(async (req, res) => {
    const topic = await TopicModel.findById(req.params.id);
    if (!topic) {
        return res.status(404).json(new ApiResponse(404, null, "Topic not found"));
    }
    const [questionCount, subTopicCount] = await Promise.all([
        QuestionModel.countDocuments({ sheetId: topic.sheetId, topic: topic.name }),
        SubTopicModel.countDocuments({ sheetId: topic.sheetId, topic: topic.name }),
    ]);
    if (questionCount > 0 || subTopicCount > 0) {
        return res.status(409).json(new ApiResponse(409, null, "Delete the topic's questions and subtopics first"));
    }
    await topic.deleteOne();
    return res.status(200).json(new ApiResponse(200, topic, "Topic deleted successfully"));
});
export const reorderTopic = asyncHandler(async (req, res) => {
    const { id, prevId, nextId } = req.body;
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "id is required"));
    }
    const topic = await TopicModel.findById(id);
    if (!topic) {
        return res.status(404).json(new ApiResponse(404, null, "Topic not found"));
    }
    const topics = await TopicModel.find({ sheetId: topic.sheetId }).sort({ order: 1, _id: 1 });
    const remainingTopics = topics.filter((item) => item._id.toString() !== id);
    const targetIndex = nextId
        ? remainingTopics.findIndex((item) => item._id.toString() === nextId)
        : prevId
            ? remainingTopics.findIndex((item) => item._id.toString() === prevId) + 1
            : remainingTopics.length;
    if ((nextId && targetIndex === -1) || (prevId && targetIndex === 0)) {
        return res.status(400).json(new ApiResponse(400, null, "Neighbor topic not found"));
    }
    remainingTopics.splice(targetIndex, 0, topic);
    await TopicModel.bulkWrite(remainingTopics.map((item, order) => ({
        updateOne: {
            filter: { _id: item._id },
            update: { $set: { order } },
        },
    })));
    return res.status(200).json(new ApiResponse(200, { id, order: targetIndex }, "Topic reordered successfully"));
});
//# sourceMappingURL=topic.controller.js.map