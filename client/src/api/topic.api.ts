import axiosInstance from "./axios";
import type { AxiosResponse } from "axios";
import type { ApiResponsePayload, ReorderPayload, ReorderResult } from "./question.api";

export interface Topic {
    _id: string;
    sheetId: string;
    name: string;
    order: number;
}

export interface AddTopicPayload {
    sheetId: string;
    name: string;
}

export interface EditTopicPayload {
    name: string;
}

const BASE_URL = "/topic";

export const getTopics = async (sheetId: string): Promise<Topic[]> => {
    const response: AxiosResponse<ApiResponsePayload<Topic[]>> =
        await axiosInstance.get(`${BASE_URL}`, { params: { sheetId } });
    return response.data.data;
};

export const getTopic = async (id: string): Promise<Topic> => {
    const response: AxiosResponse<ApiResponsePayload<Topic>> =
        await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const addTopic = async (payload: AddTopicPayload): Promise<Topic> => {
    const response: AxiosResponse<ApiResponsePayload<Topic>> =
        await axiosInstance.post(`${BASE_URL}/add-topic`, payload);
    return response.data.data;
};

export const editTopic = async (id: string, payload: EditTopicPayload): Promise<Topic> => {
    const response: AxiosResponse<ApiResponsePayload<Topic>> =
        await axiosInstance.put(`${BASE_URL}/${id}`, payload);
    return response.data.data;
};

export const deleteTopic = async (id: string): Promise<Topic> => {
    const response: AxiosResponse<ApiResponsePayload<Topic>> =
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data.data;
};

export const reorderTopic = async (payload: ReorderPayload): Promise<ReorderResult> => {
    const response: AxiosResponse<ApiResponsePayload<ReorderResult>> =
        await axiosInstance.patch(`${BASE_URL}/reorder`, payload);
    return response.data.data;
};