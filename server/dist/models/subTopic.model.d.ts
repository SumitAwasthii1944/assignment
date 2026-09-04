import { type Model } from "mongoose";
export interface SubTopics {
    sheetId: string;
    name: string;
    topic: string;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const SubTopic: Model<SubTopics>;
//# sourceMappingURL=subTopic.model.d.ts.map