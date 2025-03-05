import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryService } from './telemetry.service';
import { TELEMETRY_MODULE_OPTIONS } from '../constants';
import { TelemetryModuleOptions, MetricDefinition } from '../interfaces';
import { ConfigService } from '@nestjs/config';
import { trace, Span } from '@opentelemetry/api';
import { InternalServerErrorException } from '@nestjs/common';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let configService: ConfigService;
  const mockOptions: TelemetryModuleOptions = {
    serviceName: 'test-service',
    serviceVersion: '1.0.0',
    metrics: {
      customMetrics: [
        {
          name: 'test-counter',
          type: 'counter',
          description: 'Test counter metric',
        },
        {
          name: 'test-histogram',
          type: 'histogram',
          description: 'Test histogram metric',
        },
        {
          name: 'test-updown',
          type: 'upDownCounter',
          description: 'Test upDownCounter metric',
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        {
          provide: TELEMETRY_MODULE_OPTIONS,
          useValue: mockOptions,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key) => {
              if (key === 'APP_NAME') {
                return 'test-app';
              } else {
                throw new InternalServerErrorException();
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configService', () => {
    it('should return defined value for available key', () => {
      expect(() => configService.getOrThrow('APP_NAME')).toBeDefined();
    });

    it('should InternalServerErrorException for unavailble key', () => {
      expect(() => configService.getOrThrow('unavailable_key')).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('initializeMetrics', () => {
    it('should initialize metrics from options', () => {
      const createMetricSpy = jest.spyOn(service as any, 'createMetric');
      service['initializeMetrics']();
      expect(createMetricSpy).toHaveBeenCalledTimes(3);
      if (mockOptions.metrics?.customMetrics) {
        expect(createMetricSpy).toHaveBeenCalledWith(
          mockOptions.metrics.customMetrics[0],
        );
        expect(createMetricSpy).toHaveBeenCalledWith(
          mockOptions.metrics.customMetrics[1],
        );
        expect(createMetricSpy).toHaveBeenCalledWith(
          mockOptions.metrics.customMetrics[2],
        );
      }
    });
  });

  describe('createMetric', () => {
    it('should create a counter metric', () => {
      const counterDefinition: MetricDefinition = {
        name: 'test-counter',
        type: 'counter',
        description: 'Test counter metric',
      };
      service['createMetric'](counterDefinition);
      const metric = service.getMetric('test-counter');
      expect(metric).toBeDefined();
    });

    it('should create a histogram metric', () => {
      const histogramDefinition: MetricDefinition = {
        name: 'test-histogram',
        type: 'histogram',
        description: 'Test histogram metric',
      };
      service['createMetric'](histogramDefinition);
      const metric = service.getMetric('test-histogram');
      expect(metric).toBeDefined();
    });

    it('should create an upDownCounter metric', () => {
      const upDownCounterDefinition: MetricDefinition = {
        name: 'test-updown',
        type: 'upDownCounter',
        description: 'Test upDownCounter metric',
      };
      service['createMetric'](upDownCounterDefinition);
      const metric = service.getMetric('test-updown');
      expect(metric).toBeDefined();
    });
  });

  describe('getMetric', () => {
    it('should return the correct metric', () => {
      const counterDefinition: MetricDefinition = {
        name: 'test-counter',
        type: 'counter',
        description: 'Test counter metric',
      };
      service['createMetric'](counterDefinition);
      const metric = service.getMetric('test-counter');
      expect(metric).toBeDefined();
    });

    it('should return undefined for non-existent metric', () => {
      const metric = service.getMetric('non-existent');
      expect(metric).toBeUndefined();
    });
  });

  describe('createSpan', () => {
    it('should create a span and execute the function', async () => {
      const spanName = 'test-span';
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await service.createSpan(spanName, mockFn);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle errors in the span', async () => {
      const spanName = 'test-span';
      const mockError = new Error('test error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      await expect(service.createSpan(spanName, mockFn)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('getTraceId', () => {
    it('should return the trace ID from the current span', () => {
      const mockSpan = {
        spanContext: jest.fn().mockReturnValue({ traceId: 'test-trace-id' }),
      };
      jest.spyOn(trace, 'getSpan').mockReturnValue(mockSpan as unknown as Span);
      const traceId = service.getTraceId();
      expect(traceId).toBe('test-trace-id');
    });

    it('should return an empty string if no span is active', () => {
      jest.spyOn(trace, 'getSpan').mockReturnValue(undefined);
      const traceId = service.getTraceId();
      expect(traceId).toBe('');
    });
  });

  describe('onApplicationShutdown', () => {
    it('should handle shutdown correctly', async () => {
      await expect(service.onApplicationShutdown()).resolves.not.toThrow();
    });
  });
});
