declare class ApiResponse<T = unknown> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
    constructor(statusCode: number, data: T, message?: string);
}
export { ApiResponse };
//# sourceMappingURL=apiResponse.d.ts.map