import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { fromZodError } from 'zod-validation-error';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(error: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exception = error.getZodError();
    const validationError = fromZodError(exception, {
      prefix: null,
      prefixSeparator: ' ',
    });

    const formattedErrors = exception.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return response.status(400).json({
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
      errors: formattedErrors,
      formattedError: validationError.message,
    });
  }
}
