import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { SubTopic as SubTopicModel } from "../models/subTopic.model.js";
import { Topic as TopicModel } from "../models/topic.model.js";
import { Question as QuestionModel } from "../models/question.model.js";
const getSheetId = (req) => {
    const { sheetId } = req.body;
    return typeof sheetId === "string" && sheetId.trim() ? sheetId.trim() : null;
};
export const addSubTopic = asyncHandler(async (req, res) => {
    const sheetId = getSheetId(req);
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const topic = typeof req.body.topic === "string" ? req.body.topic.trim() : "";
    if (!sheetId || !name || !topic) {
        return res.status(400).json(new ApiResponse(400, null, "sheetId, topic, and name are required"));
    }
    const topicExists = await TopicModel.exists({ sheetId, name: topic });
    if (!topicExists) {
        return res.status(400).json(new ApiResponse(400, null, "Topic does not belong to this sheet"));
    }
    const lastSubTopic = await SubTopicModel.findOne({ sheetId, topic }).sort({ order: -1 });
    const subTopic = await SubTopicModel.create({
        sheetId,
        name,
        topic,
        order: lastSubTopic ? lastSubTopic.order + 1 : 0,
    });
    return res.status(201).json(new ApiResponse(201, subTopic, "Subtopic added successfully"));
});
export const getSubTopics = asyncHandler(async (req, res) => {
    const sheetId = typeof req.query.sheetId === "string" ? req.query.sheetId.trim() : "";
    const topic = typeof req.query.topic === "string" ? req.query.topic.trim() : "";
    if (!sheetId) {
        return res.status(400).json(new ApiResponse(400, null, "sheetId is required"));
    }
    const filter = topic ? { sheetId, topic } : { sheetId };
    const subTopics = await SubTopicModel.find(filter).sort({ order: 1, name: 1 });
    return res.status(200).json(new ApiResponse(200, subTopics, "Subtopics fetched successfully"));
});
export const getSubTopic = asyncHandler(async (req, res) => {
    const subTopic = await SubTopicModel.findById(req.params.id);
    if (!subTopic) {
        return res.status(404).json(new ApiResponse(404, null, "Subtopic not found"));
    }
    return res.status(200).json(new ApiResponse(200, subTopic, "Subtopic fetched successfully"));
});
export const editSubTopic = asyncHandler(async (req, res) => {
    const subTopic = await SubTopicModel.findById(req.params.id);
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const topic = typeof req.body.topic === "string" ? req.body.topic.trim() : "";
    if (!subTopic) {
        return res.status(404).json(new ApiResponse(404, null, "Subtopic not found"));
    }
    const updatedName = name || subTopic.name;
    const updatedTopic = topic || subTopic.topic;
    if (!(await TopicModel.exists({ sheetId: subTopic.sheetId, name: updatedTopic }))) {
        return res.status(400).json(new ApiResponse(400, null, "Topic does not belong to this sheet"));
    }
    if (updatedName !== subTopic.name || updatedTopic !== subTopic.topic) {
        await QuestionModel.updateMany({
            sheetId: subTopic.sheetId,
            topic: subTopic.topic,
            subTopic: subTopic.name,
        }, { $set: { topic: updatedTopic, subTopic: updatedName } });
    }
    subTopic.name = updatedName;
    subTopic.topic = updatedTopic;
    await subTopic.save();
    return res.status(200).json(new ApiResponse(200, subTopic, "Subtopic updated successfully"));
});
export const deleteSubTopic = asyncHandler(async (req, res) => {
    const subTopic = await SubTopicModel.findById(req.params.id);
    if (!subTopic) {
        return res.status(404).json(new ApiResponse(404, null, "Subtopic not found"));
    }
    const questionCount = await QuestionModel.countDocuments({
        sheetId: subTopic.sheetId,
        topic: subTopic.topic,
        subTopic: subTopic.name,
    });
    if (questionCount > 0) {
        return res.status(409).json(new ApiResponse(409, null, "Delete the subtopic's questions first"));
    }
    await subTopic.deleteOne();
    return res.status(200).json(new ApiResponse(200, subTopic, "Subtopic deleted successfully"));
});
export const reorderSubTopic = asyncHandler(async (req, res) => {
    const { id, prevId, nextId } = req.body;
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "id is required"));
    }
    const subTopic = await SubTopicModel.findById(id);
    if (!subTopic) {
        return res.status(404).json(new ApiResponse(404, null, "Subtopic not found"));
    }
    const subTopics = await SubTopicModel.find({
        sheetId: subTopic.sheetId,
        topic: subTopic.topic,
    }).sort({ order: 1, _id: 1 });
    const remainingSubTopics = subTopics.filter((item) => item._id.toString() !== id);
    const targetIndex = nextId
        ? remainingSubTopics.findIndex((item) => item._id.toString() === nextId)
        : prevId
            ? remainingSubTopics.findIndex((item) => item._id.toString() === prevId) + 1
            : remainingSubTopics.length;
    if ((nextId && targetIndex === -1) || (prevId && targetIndex === 0)) {
        return res.status(400).json(new ApiResponse(400, null, "Neighbor subtopic not found"));
    }
    remainingSubTopics.splice(targetIndex, 0, subTopic);
    await SubTopicModel.bulkWrite(remainingSubTopics.map((item, order) => ({
        updateOne: {
            filter: { _id: item._id },
            update: { $set: { order } },
        },
    })));
    return res.status(200).json(new ApiResponse(200, { id, order: targetIndex }, "Subtopic reordered successfully"));
});
//# sourceMappingURL=subtopic.controller.js.map