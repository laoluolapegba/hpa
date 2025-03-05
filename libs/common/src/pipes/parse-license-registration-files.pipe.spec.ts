import { Test, TestingModule } from '@nestjs/testing';
import { LicenseRegistrationFileFieldsValidationPipe } from './parse-license-registration-files.pipe';
import {
  BadRequestException,
  UnprocessableEntityException,
  PayloadTooLargeException,
} from '@nestjs/common';

describe('LicenseRegistrationFileFieldsValidationPipe', () => {
  let pipe: LicenseRegistrationFileFieldsValidationPipe;

  const mockGenericFileAttr = {
    originalname: 'test.jpg',
    encoding: '7bit',
    buffer: Buffer.from([]),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LicenseRegistrationFileFieldsValidationPipe],
    }).compile();

    pipe = module.get<LicenseRegistrationFileFieldsValidationPipe>(
      LicenseRegistrationFileFieldsValidationPipe,
    );
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should validate required files', async () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
      };

      const result = pipe.transform(mockFiles);
      expect(result).toEqual(mockFiles);
    });

    it('should throw BadRequestException if required files are missing', async () => {
      const mockFiles = {
        taxReceipt: [],
        innerSketch: [],
        lawmaLetter: [],
        hmisLetter: [],
      };

      expect(() => pipe.transform(mockFiles)).toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException for invalid file types', async () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'taxReceipt',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
        innerSketch: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'innerSketch',
            originalname: 'test.jpg',
            encoding: '7bit',
            buffer: Buffer.from([]),
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      expect(() => pipe.transform(mockFiles)).toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw PayloadTooLargeException for oversized files', async () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 4 * 1024 * 1024,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      expect(() => pipe.transform(mockFiles)).toThrow(PayloadTooLargeException);
    });

    it('should throw BadRequestException if any field has multiple files', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      expect(() => pipe.transform(mockFiles)).toThrow(BadRequestException);
    });

    it('should accept PDF for LAWMA letter', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      const result = pipe.transform(mockFiles);
      expect(result).toEqual(mockFiles);
    });

    it('should accept JPG for LAWMA letter', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      const result = pipe.transform(mockFiles);
      expect(result).toEqual(mockFiles);
    });

    it('should accept PNG for HMIS letter', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'image/png',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      const result = pipe.transform(mockFiles);
      expect(result).toEqual(mockFiles);
    });

    it('should throw UnprocessableEntityException for invalid file type for taxReceipt', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'text/plain', // Invalid type
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        innerSketch: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'innerSketch',
            ...mockGenericFileAttr,
          },
        ],
        lawmaLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaLetter',
            ...mockGenericFileAttr,
          },
        ],
        hmisLetter: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'hmisLetter',
            ...mockGenericFileAttr,
          },
        ],
      };

      expect(() => pipe.transform(mockFiles)).toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
