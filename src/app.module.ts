import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomLoggerModule } from '@app/common';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { FacilitiesModule } from './facilities/facilities.module';
import { UtilsModule } from './utils/utils.module';
import { PractitionersModule } from './practitioners/practitioners.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LicenseApplicationsModule } from './license-applications/license-applications.module';

@Module({
  imports: [
    // TelemetryModule.forRoot({
    //   serviceName: 'HEFAMAA_PORTAL-API',
    //   exporters: {
    //     otlp: {
    //       endpoint: 'http://localhost:4317',
    //       protocol: 'grpc',
    //     },
    //     prometheus: true,
    //   },
    //   metrics: {
    //     prometheusPort: 9464,
    //   },
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().required(),
        APP_NAME: Joi.string().trim().min(1).required(),
        APP_URL: Joi.string().trim().min(1).required(),
        DATABASE_URL: Joi.string().trim().min(1).required(),
        CORS_ALLOWED_ORIGINS: Joi.string().trim().min(1).required(),
        CORS_ALLOW_UNDEFINED_ORIGIN: Joi.boolean().default(false),
        OKTA_CLIENT_SECRET: Joi.string().trim().min(1).required(),
        OKTA_CLIENT_ID: Joi.string().trim().min(1).required(),
        OKTA_ISSUER: Joi.string().uri().required(),
        OKTA_DOMAIN: Joi.string().uri().required(),
        OKTA_AUDIENCE: Joi.string().trim().min(1).required(),
        OKTA_CALLBACK_URL: Joi.string().uri().required(),
        SESSION_SECRET: Joi.string().trim().min(1).required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CustomLoggerModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FacilitiesModule,
    UtilsModule,
    PractitionersModule,
    OrganizationsModule,
    LicenseApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
