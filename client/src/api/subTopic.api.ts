import axiosInstance from "./axios";
import type { AxiosResponse } from "axios";
import type { ApiResponsePayload, ReorderPayload, ReorderResult } from "./question.api";

export interface SubTopic {
    _id: string;
    sheetId: string;
    topic: string;
    name: string;
    order: number;
}

export interface AddSubTopicPayload {
    sheetId: string;
    name: string;
}

export interface EditSubTopicPayload {
    name?: string;
    topic?: string;
}

const BASE_URL = "/subTopic";

export const getSubTopics = async (sheetId: string, topic?: string): Promise<SubTopic[]> => {
    const response: AxiosResponse<ApiResponsePayload<SubTopic[]>> =
        await axiosInstance.get(`${BASE_URL}`, { params: { sheetId, topic } });
    return response.data.data;
};

export const getSubTopic = async (id: string): Promise<SubTopic> => {
    const response: AxiosResponse<ApiResponsePayload<SubTopic>> =
        await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const addSubTopic = async (topic: string, payload: AddSubTopicPayload): Promise<SubTopic> => {
    const response: AxiosResponse<ApiResponsePayload<SubTopic>> =
        await axiosInstance.post(`${BASE_URL}/${encodeURIComponent(topic)}/add-sub-topic`, payload);
    return response.data.data;
};

export const editSubTopic = async (id: string, payload: EditSubTopicPayload): Promise<SubTopic> => {
    const response: AxiosResponse<ApiResponsePayload<SubTopic>> =
        await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data.data;
};

export const deleteSubTopic = async (id: string): Promise<SubTopic> => {
    const response: AxiosResponse<ApiResponsePayload<SubTopic>> =
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const reorderSubTopic = async (payload: ReorderPayload): Promise<ReorderResult> => {
    const response: AxiosResponse<ApiResponsePayload<ReorderResult>> =
        await axiosInstance.patch(`${BASE_URL}/reorder`, payload);
    return response.data.data;
};