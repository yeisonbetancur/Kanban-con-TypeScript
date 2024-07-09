import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: string | object;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => any;
export {};
