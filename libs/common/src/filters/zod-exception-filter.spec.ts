import { Test, TestingModule } from '@nestjs/testing';
import { ZodExceptionFilter } from './zod-exception-filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { Response } from 'express';
import { ZodIssue } from 'zod-validation-error';
import { ZodError } from 'zod';

describe('ZodExceptionFilter', () => {
  let filter: ZodExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZodExceptionFilter],
    }).compile();

    filter = module.get<ZodExceptionFilter>(ZodExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should format Zod validation errors', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const getResponse = () => mockResponse;

      const mockHost = {
        switchToHttp: () => ({
          getResponse,
        }),
      } as ArgumentsHost;

      const issues: ZodIssue[] = [
        {
          path: ['field'],
          message: 'Invalid field',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ];

      const mockZodError = new ZodError(issues);

      const mockError = new ZodValidationException(mockZodError);

      filter.catch(mockError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        timestamp: expect.any(String),
        errors: [
          { field: 'field', message: 'Invalid field', code: 'invalid_type' },
        ],
        formattedError: 'Invalid field at "field"',
      });
    });
  });
});
