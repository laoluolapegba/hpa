import { Module, RequestMethod } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { hostname } from 'os';
import { Request, Response } from 'express';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get('NODE_ENV') === 'production' ? 'info' : 'debug',

            transport:
              config.get('NODE_ENV') !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      ignore:
                        'pid,host,context,req,res,responseTime,trace_id,span_id,trace_flags,correlationId',
                      messageFormat:
                        'pid:{pid} - url:{req.url} - traceId:{trace_id} - spanId:{span_id} - status:{res.statusCode} - responseTime:{responseTime} - msg: {msg}',
                    },
                  }
                : undefined,

            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.token',
                'req.body.creditCard',
              ],
              remove: true,
            },

            serializers: {
              req: (req: Request) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                path: req.path,
                params: req.params,
                query: req.query,
                headers: {
                  'user-agent': req.headers['user-agent'],
                  'content-type': req.headers['content-type'],
                },
              }),
              res: (res: Response) => ({
                statusCode: res.statusCode,
              }),
              err: (err) => ({
                type: err.type,
                message: err.message,
                stack: err.stack,
                code: err.code,
              }),
            },

            formatters: {
              level: (label) => ({ level: label }),
              bindings: () => ({
                pid: process.pid,
                host: hostname(),
              }),
            },

            customProps: (req) => ({
              correlationId: req.id,
              context: 'HTTP',
            }),

            exclude: [
              { method: RequestMethod.ALL, path: 'health' },
              { method: RequestMethod.ALL, path: 'metrics' },
            ],
          },
        };
      },
    }),
  ],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class CustomLoggerModule {}
