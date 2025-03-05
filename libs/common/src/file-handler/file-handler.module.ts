import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { S3HandlerService } from './file-handler.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        S3_ACCESS_KEY: Joi.string().min(1).required(),
        S3_SECRET_KEY: Joi.string().min(1).required(),
        S3_BUCKET_NAME: Joi.string().min(1).required(),
        S3_ENDPOINT: Joi.string().min(1).required(),
      }),
    }),
  ],
  providers: [S3HandlerService],
  exports: [S3HandlerService],
})
export class FileHandlerModule {}
