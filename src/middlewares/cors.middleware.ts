import { CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const configService = new ConfigService();

export const allowUndefinedOrigin = configService.get<string | undefined>(
  'CORS_ALLOW_UNDEFINED_ORIGIN',
);

const origins = configService.getOrThrow<string>('CORS_ALLOWED_ORIGINS');
console.log({ origins });

export const allowedOrigins =
  origins?.split(',').filter((origin) => origin.trim() !== '') || [];

export const corsOptionsDelegate: CorsOptionsDelegate<Request> = function (
  req,
  callback,
) {
  const path = req.originalUrl;
  const skipUrls = ['/health', '/metrics'];

  const skipCors = skipUrls.includes(path);

  if (skipCors) {
    callback(null, { origin: false });
  } else {
    callback(null, {
      // allowedHeaders: ['Content-Type', 'Authorization'],
      origin: function (origin: string | undefined, callback) {
        if (
          (!origin && allowUndefinedOrigin) ||
          (origin && allowedOrigins.includes(origin))
        ) {
          callback(null, true);
        } else {
          const msg =
            'The CORS policy for this site does not allow access from the specified origin';
          callback(new Error(msg), false);
        }
      },
      // preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    });
  }
};
