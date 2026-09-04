import mongoose, { Schema } from "mongoose";
const QuestionDocumentSchema = new Schema({
    _id: String,
    id: Schema.Types.Mixed,
    name: { type: String, required: true },
    slug: { type: String, required: true },
    platform: { type: String, required: true },
    problemUrl: { type: String, required: true },
    difficulty: String,
    description: String,
    topics: [String],
    companyTags: [String],
    verified: Boolean,
}, { _id: false });
const QuestionSchema = new Schema({
    sheetId: { type: String, required: true, index: true },
    questionId: { type: QuestionDocumentSchema, required: true },
    topic: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    subTopic: { type: String, default: null, index: true, trim: true },
    resource: { type: String, default: null },
    session: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    isSolved: { type: Boolean, default: false },
    questionDocumentId: { type: String, default: null },
    order: { type: Number, required: true },
}, { timestamps: true });
export const Question = mongoose.model("Question", QuestionSchema);
//# sourceMappingURL=question.model.js.map