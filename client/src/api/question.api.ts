import axiosInstance from "./axios";
import type { AxiosResponse } from "axios";

export interface ApiResponsePayload<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface QuestionIdRef {
    _id: string;
    id: string;
    name: string;
    slug: string;
    platform: string;
    problemUrl: string;
    difficulty: string;
    description?: string;
    topics: string[];
    companyTags?: string[];
    verified?: boolean;
}

export interface Question {
    _id: string;
    questionId: QuestionIdRef;
    sheetId: string;
    topic: string;
    title: string;
    subTopic: string | null;
    resource?: string;
    session: string;
    isPublic: boolean;
    isSolved: boolean;
    questionDocumentId: string | null;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddQuestionPayload {
    questionId: QuestionIdRef;
    sheetId: string;
    topic: string;
    title: string;
    subTopic?: string | null;
    resource?: string;
    session: string;
    isPublic?: boolean;
}

export interface EditQuestionPayload {
    topic?: string;
    title?: string;
    subTopic?: string | null;
    resource?: string;
    session?: string;
    isPublic?: boolean;
    isSolved?: boolean;
}

export interface ReorderPayload {
    id: string;
    prevId?: string | null;
    nextId?: string | null;
}

export interface ReorderResult {
    id: string;
    order: number;
}

const BASE_URL = "/question";

export const getQuestion = async (id: string): Promise<Question> => {
    const response: AxiosResponse<ApiResponsePayload<Question>> =
        await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const getQuestions = async (sheetId: string): Promise<Question[]> => {
    const response: AxiosResponse<ApiResponsePayload<Question[]>> =
        await axiosInstance.get(`${BASE_URL}`, { params: { sheetId } });
    return response.data.data;
};

export const addQuestion = async (payload: AddQuestionPayload): Promise<Question> => {
    const response: AxiosResponse<ApiResponsePayload<Question>> =
        await axiosInstance.post(`${BASE_URL}/add-question`, payload);
    return response.data.data;
};

export const editQuestion = async (id: string, payload: EditQuestionPayload): Promise<Question> => {
    const response: AxiosResponse<ApiResponsePayload<Question>> =
        await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data.data;
};

export const deleteQuestion = async (id: string): Promise<{}> => {
    const response: AxiosResponse<ApiResponsePayload<{}>> =
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const undoDelete = async (id: string): Promise<Question> => {
    const response:AxiosResponse<ApiResponsePayload<Question>> =
        await axiosInstance.get(`${BASE_URL}/undo/${id}`);
    
    return response.data.data
}

export const reorderQuestion = async (payload: ReorderPayload): Promise<ReorderResult> => {
    const response: AxiosResponse<ApiResponsePayload<ReorderResult>> =
        await axiosInstance.patch(`${BASE_URL}/reorder`, payload);
    return response.data.data;
};