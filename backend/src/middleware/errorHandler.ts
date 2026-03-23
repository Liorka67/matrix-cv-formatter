import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Error occurred:', {
    statusCode,
    message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Ensure CORS headers are applied even on error
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS requests should return 204 No Content
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  // Ensure CORS headers are applied for 404 responses too
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS requests should return 204 No Content
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};