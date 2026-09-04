export interface CodolioStatus {
  code: number;
  success: boolean;
  message: string;
  error: unknown;
}

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

export interface CodolioQuestion {
  _id: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CodolioSheetConfig {
  topicOrder: string[];
  subTopicOrder: Record<string, string[]>;
  questionOrder: string[];
}

export interface CodolioSheet {
  _id: string;
  name: string;
  slug: string;
  description: string;
  visibility: string;
  config: CodolioSheetConfig;
  banner: string;
  author: string;
  followers: number;
}

export interface CodolioResponse {
  status: CodolioStatus;
  data: {
    sheet: CodolioSheet;
    questions: CodolioQuestion[];
    email: string | null;
  };
}
