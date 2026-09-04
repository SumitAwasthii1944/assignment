import mongoose, { Schema } from "mongoose";
const TopicSchema = new Schema({
    sheetId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
}, { timestamps: true });
TopicSchema.index({ sheetId: 1, name: 1 }, { unique: true });
export const Topic = mongoose.model("Topic", TopicSchema);
//# sourceMappingURL=topic.model.js.map