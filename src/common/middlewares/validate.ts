import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';

/**
 * Validation middleware using Zod schemas.
 * Validates body, query, and/or params.
 */
export function validate(schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as Record<string, string>;
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw AppError.badRequest('Validation failed', errors);
      }
      throw err;
    }
  };
}
