import { type Model } from "mongoose";
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
export declare const Question: Model<Questions>;
//# sourceMappingURL=question.model.d.ts.map