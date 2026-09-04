export interface AsyncState {
    loading: boolean;
    error: string | null;
}

export const initialAsyncState: AsyncState = {
    loading: false,
    error: null,
};