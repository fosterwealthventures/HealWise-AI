import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ error: 'ValidationError', issues });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  logger.error('Unhandled error', { message: error.message, stack: error.stack });
  return res.status(500).json({ error: 'Internal Server Error' });
};
