import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500, error?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message = 'Success'
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}
