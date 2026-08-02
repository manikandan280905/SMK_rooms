import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return sendError(res, 'A record with this value already exists', 409);
      case 'P2025':
        return sendError(res, 'Record not found', 404);
      case 'P2003':
        return sendError(res, 'Related record not found', 400);
      default:
        return sendError(res, 'Database error', 500);
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, 'Invalid data provided', 400);
  }

  // Default
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';
  return sendError(res, message, statusCode);
}
