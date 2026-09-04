import mongoose, { Schema, type Model } from "mongoose";

export interface Topics {
  sheetId: string;
  name: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TopicSchema = new Schema<Topics>(
  {
    sheetId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

TopicSchema.index({ sheetId: 1, name: 1 }, { unique: true });

export const Topic: Model<Topics> = mongoose.model("Topic", TopicSchema);
