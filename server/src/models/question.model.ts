import mongoose, { Schema, type Model } from "mongoose";

export interface QuestionDocument {
  _id: string;
  id?: string | number;
  name: string;
  slug: string;
  platform: string;
  problemUrl: string;
  difficulty?: string;
  description?: string;
  topics?: string[];
  companyTags?: string[];
  verified?: boolean;
}

export interface Questions {
  sheetId: string;
  questionId: QuestionDocument;
  topic: string;
  title: string;
  subTopic: string | null;
  resource: string | null;
  session: string;
  isPublic: boolean;
  isSolved: boolean;
  questionDocumentId: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionDocumentSchema = new Schema(
  {
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
  },
  { _id: false },
);

const QuestionSchema = new Schema<Questions>(
  {
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
  },
  { timestamps: true },
);

export const Question: Model<Questions> = mongoose.model("Question", QuestionSchema);
