import { Request, Response } from 'express';
export declare const getCardsByColumnId: (req: Request, res: Response) => Promise<Response>;
export declare const createCard: (req: Request, res: Response) => Promise<Response>;
export declare const updateCard: (req: Request, res: Response) => Promise<Response>;
export declare const deleteCard: (req: Request, res: Response) => Promise<Response>;
