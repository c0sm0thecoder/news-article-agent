import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: Error): void {
  if (error instanceof AppError && error.isOperational) {
    logger.warn(`Operational error: ${error.message}`);
  } else {
    // Non-operational errors might require application restart
    logger.error(`Unhandled error: ${error.message}`, { stack: error.stack });
  }
}