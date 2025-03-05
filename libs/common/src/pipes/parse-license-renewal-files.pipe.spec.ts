import { Test, TestingModule } from '@nestjs/testing';
import { LicenseRenewalFileFieldsValidationPipe } from './parse-license-renewal-files.pipe';
import {
  BadRequestException,
  UnprocessableEntityException,
  PayloadTooLargeException,
} from '@nestjs/common';

describe('LicenseRenewalFileFieldsValidationPipe', () => {
  let pipe: LicenseRenewalFileFieldsValidationPipe;

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
      providers: [LicenseRenewalFileFieldsValidationPipe],
    }).compile();

    pipe = module.get<LicenseRenewalFileFieldsValidationPipe>(
      LicenseRenewalFileFieldsValidationPipe,
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
            ...mockGenericFileAttr,
          },
        ],
        latestLicenseCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'latestLicenseCertificate',
            ...mockGenericFileAttr,
          },
        ],
        lawmaCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaCertificate',
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

    it('should throw BadRequestException if required files are missing', async () => {
      const mockFiles = {
        taxReceipt: [],
        latestLicenseCertificate: [],
        lawmaCertificate: [],
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
            ...mockGenericFileAttr,
          },
        ],
        latestLicenseCertificate: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'latestLicenseCertificate',
            ...mockGenericFileAttr,
          },
        ],
        lawmaCertificate: [
          {
            mimetype: 'image/jpeg',
            size: 1000,
            fieldname: 'lawmaCertificate',
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
        latestLicenseCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'latestLicenseCertificate',
            ...mockGenericFileAttr,
          },
        ],
        lawmaCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaCertificate',
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

    it('should throw UnprocessableEntityException for invalid file type for taxReceipt', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'text/plain',
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        latestLicenseCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'latestLicenseCertificate',
            ...mockGenericFileAttr,
          },
        ],
        lawmaCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaCertificate',
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

    it('should accept PNG for HMIS letter', () => {
      const mockFiles = {
        taxReceipt: [
          {
            mimetype: 'image/png', // Invalid type
            size: 1000,
            fieldname: 'taxReceipt',
            ...mockGenericFileAttr,
          },
        ],
        latestLicenseCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'latestLicenseCertificate',
            ...mockGenericFileAttr,
          },
        ],
        lawmaCertificate: [
          {
            mimetype: 'application/pdf',
            size: 1000,
            fieldname: 'lawmaCertificate',
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
  });
});
