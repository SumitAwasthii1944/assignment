export function extractErrorMessage(err: unknown): string {
    if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) return response.data.message;
    }
    if (err instanceof Error) return err.message;
    return "Something went wrong";
}