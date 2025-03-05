import { Test, TestingModule } from '@nestjs/testing';
import { ParseFilesPipe } from './parse-files.pipe';
import { ParseFilePipe } from '@nestjs/common';

describe('ParseFilesPipe', () => {
  let pipe: ParseFilesPipe;
  let parseFilePipe: ParseFilePipe;

  beforeEach(async () => {
    const mockParseFilePipe = {
      transform: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ParseFilePipe,
          useValue: mockParseFilePipe,
        },
        {
          provide: ParseFilesPipe,
          useFactory: (parseFilePipe: ParseFilePipe) =>
            new ParseFilesPipe(parseFilePipe),
          inject: [ParseFilePipe],
        },
      ],
    }).compile();

    pipe = module.get<ParseFilesPipe>(ParseFilesPipe);
    parseFilePipe = module.get<ParseFilePipe>(ParseFilePipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should validate an array of files', async () => {
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'file1',
          mimetype: 'image/jpeg',
          size: 1000,
          originalname: 'test.jpg',
          encoding: '7bit',
          buffer: Buffer.from([]),
          stream: null as any,
          destination: '',
          filename: '',
          path: '',
        },
        {
          fieldname: 'file2',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from([]),
          stream: null as any,
          destination: '',
          filename: '',
          path: '',
        },
      ];

      const result = await pipe.transform(mockFiles);
      expect(result).toEqual(mockFiles);
      expect(parseFilePipe.transform).toHaveBeenCalled();
    });

    it('should validate an object of files', async () => {
      const mockFiles: { [key: string]: Express.Multer.File } = {
        file1: {
          fieldname: 'file1',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from([]),
          stream: null as any,
          destination: '',
          filename: '',
          path: '',
        },
        file2: {
          fieldname: 'file2',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1000,
          buffer: Buffer.from([]),
          stream: null as any,
          destination: '',
          filename: '',
          path: '',
        },
      };

      const result = await pipe.transform(mockFiles);
      expect(result).toEqual(Object.values(mockFiles).flat());
      expect(parseFilePipe.transform).toHaveBeenCalled();
    });
  });
});
