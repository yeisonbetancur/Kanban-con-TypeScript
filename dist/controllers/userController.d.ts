import { Request, Response } from 'express';
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUserEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateUserPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
