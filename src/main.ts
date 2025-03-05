import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';
import helmet from 'helmet';
import * as session from 'express-session';
import { corsOptionsDelegate } from './middlewares';
import { Logger } from 'nestjs-pino';
import { ZodExceptionFilter } from '@app/common';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const globalPrefix = 'api/v1';

  app.set('trust proxy', 'loopback');
  app.use(cors(corsOptionsDelegate));
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(
    session({
      secret: configService.getOrThrow('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: configService.get('NODE_ENV') === 'production',
      },
    }),
  );

  app.use(passport.session());

  app.useGlobalFilters(new ZodExceptionFilter());

  app.setGlobalPrefix(globalPrefix, { exclude: ['health', 'metric'] });

  const useProxy = configService.get('USE_PROXY');

  console.log({ useProxy });

  if (!useProxy) {
    process.env.HTTP_PROXY = undefined;
    process.env.HTTPS_PROXY = undefined;
  }

  const port = configService.get('PORT') || 8000;
  await app.listen(port);
}
bootstrap();
