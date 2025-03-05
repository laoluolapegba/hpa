import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomLogger extends Logger {
  logOperation(operation: string, metadata: Record<string, any>) {
    this.log({
      operation,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }

  logError(error: Error, context: string, metadata?: Record<string, any>) {
    this.error({
      message: error.message,
      stack: error.stack,
      context,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }
}
