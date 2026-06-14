import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

type ErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const payload =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponse)
        : null;

    const message =
      payload?.message ??
      (typeof exceptionResponse === "string"
        ? exceptionResponse
        : "Une erreur interne est survenue.");

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error
          ? exception.message
          : "Erreur interne non HTTP.",
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      method: request.method,
      message,
      error: payload?.error ?? HttpStatus[status],
      timestamp: new Date().toISOString(),
    });
  }
}
