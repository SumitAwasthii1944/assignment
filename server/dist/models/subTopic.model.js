import mongoose, { Schema } from "mongoose";
const SubTopicSchema = new Schema({
    sheetId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    topic: { type: String, required: true, index: true, trim: true },
    order: { type: Number, required: true },
}, { timestamps: true });
SubTopicSchema.index({ sheetId: 1, topic: 1, name: 1 }, { unique: true });
export const SubTopic = mongoose.model("SubTopic", SubTopicSchema);
//# sourceMappingURL=subTopic.model.js.map