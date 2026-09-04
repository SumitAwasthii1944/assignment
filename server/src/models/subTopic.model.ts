import mongoose, { Schema, type Model } from "mongoose";

export interface SubTopics {
  sheetId: string;
  name: string;
  topic: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubTopicSchema = new Schema<SubTopics>(
  {
    sheetId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    topic: { type: String, required: true, index: true, trim: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

SubTopicSchema.index(
  { sheetId: 1, topic: 1, name: 1 },
  { unique: true },
);

export const SubTopic: Model<SubTopics> = mongoose.model("SubTopic", SubTopicSchema);
