import { type Model } from "mongoose";
export interface Topics {
    sheetId: string;
    name: string;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const Topic: Model<Topics>;
//# sourceMappingURL=topic.model.d.ts.map