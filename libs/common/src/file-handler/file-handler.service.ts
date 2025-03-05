import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../logger';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3HandlerService {
  private readonly S3_ACCESS_KEY: string;
  private readonly S3_SECRET_KEY: string;
  private readonly S3_BUCKET_NAME: string;
  private readonly S3_ENDPOINT: string;

  private readonly credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };

  private readonly s3client: S3Client;

  private readonly logger = new CustomLogger(S3HandlerService.name);

  constructor(configService: ConfigService) {
    this.S3_BUCKET_NAME = configService.getOrThrow('S3_BUCKET_NAME');
    this.S3_ACCESS_KEY = configService.getOrThrow('S3_ACCESS_KEY');
    this.S3_SECRET_KEY = configService.getOrThrow('S3_SECRET_KEY');
    this.S3_ENDPOINT = configService.getOrThrow('S3_ENDPOINT');

    this.credentials = {
      accessKeyId: this.S3_ACCESS_KEY,
      secretAccessKey: this.S3_SECRET_KEY,
    };

    this.s3client = new S3Client({
      credentials: this.credentials,
      forcePathStyle: true,
      endpoint: this.S3_ENDPOINT,
      region: 'eu-east-1',
    });
  }

  async getFileUrl(name: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: name,
      });

      const url = await getSignedUrl(this.s3client, command, {
        expiresIn: 3600,
      });

      return url;
    } catch (error) {
      this.logger.logError(error, 'Error getting file URL');
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  async getFile(name: string) {
    const command = new GetObjectCommand({
      Bucket: this.S3_BUCKET_NAME,
      Key: name,
    });

    const { Body, ContentType, ContentLength } = await this.s3client
      .send(command)
      .catch((err) => {
        if (err instanceof NoSuchKey) {
          this.logger.logError(
            err,
            `Error from S3 while getting object "${name}" from "${this.S3_BUCKET_NAME}". No such key exists.`,
          );

          throw new NotFoundException('File not found');
        } else if (err instanceof S3ServiceException) {
          this.logger.logError(
            err,
            `Error from S3 while getting object from ${this.S3_BUCKET_NAME}. ${err.name}: ${err.message}`,
          );
          throw new InternalServerErrorException('Unexpected error occured');
        }

        this.logger.logError(err, 'Error getting s3 file');
        throw new InternalServerErrorException('Unexpected error occured');
      });

    if (!Body) {
      throw new NotFoundException('File not found');
    }

    const streamableFile = new StreamableFile(Body as any);

    return {
      headers: {
        'Content-Type': ContentType ?? 'application/octet-stream',
        'Content-length': ContentLength,
        'Content-Disposition': `inline;filename=${name}`,
      },
      streamableFile,
    };
  }

  async uploadFile(file: Buffer, name: string, mimeType: string) {
    const command = new PutObjectCommand({
      Bucket: this.S3_BUCKET_NAME,
      Key: name,
      Body: file,
      ContentType: mimeType,
    });

    await this.s3client.send(command).catch((err) => {
      if (err instanceof S3ServiceException) {
        this.logger.logError(
          err,
          `Error from S3 while uploading object to ${this.S3_BUCKET_NAME}. ${err.name}: ${err.message}`,
        );
        throw new InternalServerErrorException('Unexpected error occured');
      }

      this.logger.logError(err, 'Error uploading file to s3');
      throw new InternalServerErrorException('Unexpected error occured');
    });

    const url = await this.getFileUrl(name);

    return { name, url };
  }

  async replaceFile(file: Buffer, name: string, mimeType: string) {
    await this.deleteFile(name);
    return await this.uploadFile(file, name, mimeType);
  }

  async deleteFile(name: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.S3_BUCKET_NAME,
      Key: name,
    });

    await this.s3client.send(command).catch((err) => {
      if (err instanceof S3ServiceException) {
        this.logger.logError(
          err,
          `Error from S3 while deleting object from ${this.S3_BUCKET_NAME}. ${err.name}: ${err.message}`,
        );
        throw new InternalServerErrorException('Unexpected error occured');
      }

      this.logger.logError(err, 'Error deleting s3 file');
      throw new InternalServerErrorException('Unexpected error occured');
    });
  }
}
