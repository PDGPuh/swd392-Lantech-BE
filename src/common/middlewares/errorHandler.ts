import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { isDev } from '../../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // Prisma known request error
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      message: 'Database request error',
      errors: [{ detail: err.message }],
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: isDev ? [{ detail: err.message, stack: err.stack }] : [],
  });
}
