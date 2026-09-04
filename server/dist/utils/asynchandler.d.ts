import type { Request, Response, NextFunction, RequestHandler } from "express";
declare const asyncHandler: (requestHandler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler };
//# sourceMappingURL=asynchandler.d.ts.map