import { Request, Response } from 'express';
export declare const getColumnByUserId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createColumn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateColumn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteColumn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
