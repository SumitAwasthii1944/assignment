declare class ApiError extends Error {
    statusCode: number;
    data: unknown;
    success: boolean;
    errors: unknown[];
    constructor(statusCode: number, message?: string, errors?: unknown[], stack?: string);
}
export { ApiError };
//# sourceMappingURL=apiError.d.ts.map