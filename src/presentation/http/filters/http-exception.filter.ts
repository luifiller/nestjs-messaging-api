import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponse } from '../interfaces/error-response.interface';

/**
 * Global exception filter that catches all HTTP exceptions
 * and formats them into a standardized error response
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const errorDetails =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).details
        : undefined;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      error: exception.name,
      details: errorDetails,
    };

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${errorMessage}]`,
    );

    response.status(status).json(errorResponse);
  }
}
