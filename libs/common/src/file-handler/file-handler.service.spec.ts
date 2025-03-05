import { Test, TestingModule } from '@nestjs/testing';
import { S3HandlerService } from './file-handler.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, NoSuchKey, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3HandlerService', () => {
  let service: S3HandlerService;
  let configService: ConfigService;
  let s3Client: S3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3HandlerService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key) => {
              switch (key) {
                case 'S3_BUCKET_NAME':
                  return 'test-bucket';
                case 'S3_ACCESS_KEY':
                  return 'access-key';
                case 'S3_SECRET_KEY':
                  return 'secret-key';
                case 'S3_ENDPOINT':
                  return 'https://s3.example.com';
                default:
                  throw new InternalServerErrorException();
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3HandlerService>(S3HandlerService);
    configService = module.get<ConfigService>(ConfigService);
    s3Client = new S3Client({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configService', () => {
    it('should return defined value for available key', () => {
      expect(() => configService.getOrThrow('S3_BUCKET_NAME')).toBeDefined();
    });

    it('should InternalServerErrorException for unavailble key', () => {
      expect(() => configService.getOrThrow('unavailable_key')).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFileUrl', () => {
    it('should return a signed URL for the file', async () => {
      const mockUrl = 'https://s3.example.com/test-bucket/test-file';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.getFileUrl('test-file');
      expect(result).toEqual(mockUrl);
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on S3 error', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('S3 error'));

      await expect(service.getFileUrl('test-file')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFile', () => {
    it('should return a file stream', async () => {
      const mockFile = {
        Body: 'file-content',
        ContentType: 'image/jpeg',
        ContentLength: 100,
      };
      (s3Client.send as jest.Mock).mockResolvedValue(mockFile);

      const result = await service.getFile('test-file');
      expect(result.streamableFile).toBeInstanceOf(StreamableFile);
      expect(result.headers).toEqual({
        'Content-Type': 'image/jpeg',
        'Content-length': 100,
        'Content-Disposition': 'inline;filename=test-file',
      });
    });

    it('should throw NotFoundException if file does not exist', async () => {
      (s3Client.send as jest.Mock).mockRejectedValue(
        new NoSuchKey({ message: 'No such key', $metadata: {} }),
      );

      await expect(service.getFile('test-file')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on S3 error', async () => {
      (s3Client.send as jest.Mock).mockRejectedValue(
        new S3ServiceException({
          message: 'S3 error',
          $metadata: {},
          name: 's3Error',
          $fault: 'server',
        }),
      );

      await expect(service.getFile('test-file')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload a file and return its URL', async () => {
      const mockUrl = 'https://s3.example.com/test-bucket/test-file';
      (s3Client.send as jest.Mock).mockResolvedValue({});
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.uploadFile(
        Buffer.from('file-content'),
        'test-file',
        'image/jpeg',
      );
      expect(result).toEqual({ name: 'test-file', url: mockUrl });
    });

    it('should throw InternalServerErrorException on S3 error', async () => {
      (s3Client.send as jest.Mock).mockRejectedValue(
        new S3ServiceException({
          message: 'S3 error',
          $metadata: {},
          name: 's3Error',
          $fault: 'server',
        }),
      );

      await expect(
        service.uploadFile(
          Buffer.from('file-content'),
          'test-file',
          'image/jpeg',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('replaceFile', () => {
    it('should delete the old file and upload a new one', async () => {
      const mockUrl = 'https://s3.example.com/test-bucket/test-file';
      (s3Client.send as jest.Mock).mockResolvedValue({});
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await service.replaceFile(
        Buffer.from('file-content'),
        'test-file',
        'image/jpeg',
      );
      expect(result).toEqual({ name: 'test-file', url: mockUrl });
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      (s3Client.send as jest.Mock).mockResolvedValue({});

      await service.deleteFile('test-file');
      expect(s3Client.send).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on S3 error', async () => {
      (s3Client.send as jest.Mock).mockRejectedValue(
        new S3ServiceException({
          message: 'S3 error',
          $metadata: {},
          name: 's3Error',
          $fault: 'server',
        }),
      );

      await expect(service.deleteFile('test-file')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
