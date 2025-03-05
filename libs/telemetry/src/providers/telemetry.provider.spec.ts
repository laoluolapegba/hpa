import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { metrics, context } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { createTelemetryProviders } from './telemetry.provider';

// Mock all OpenTelemetry dependencies
jest.mock('@opentelemetry/instrumentation-http');
jest.mock('@opentelemetry/instrumentation-express');
jest.mock('@opentelemetry/instrumentation-nestjs-core');
jest.mock('@opentelemetry/instrumentation-pino');
jest.mock('@opentelemetry/sdk-trace-base');
jest.mock('@opentelemetry/resources');
jest.mock('@opentelemetry/exporter-trace-otlp-grpc');
jest.mock('@opentelemetry/exporter-metrics-otlp-grpc');
jest.mock('@opentelemetry/sdk-metrics');
jest.mock('@opentelemetry/exporter-prometheus');
jest.mock('@opentelemetry/api');
jest.mock('@opentelemetry/sdk-node');
jest.mock('@opentelemetry/context-async-hooks');

describe('TelemetryProvider', () => {
  let mockEnable: jest.Mock;
  let mockSetGlobalContextManager: jest.Mock;
  let mockSetGlobalMeterProvider: jest.Mock;
  let mockNodeSDKStart: jest.Mock;
  let mockNodeSDKShutdown: jest.Mock;
  let mockMeterProviderShutdown: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock instrumentations
    (HttpInstrumentation as jest.Mock).mockImplementation(() => ({
      instrumentations: [],
      createHistogram: jest.fn(),
    }));
    (ExpressInstrumentation as jest.Mock).mockImplementation(() => ({
      instrumentations: [],
      createHistogram: jest.fn(),
    }));
    (NestInstrumentation as unknown as jest.Mock).mockImplementation(() => ({
      instrumentations: [],
      createHistogram: jest.fn(),
    }));
    (PinoInstrumentation as jest.Mock).mockImplementation(() => ({
      instrumentations: [],
      createHistogram: jest.fn(),
    }));

    // Setup mocks
    mockEnable = jest.fn();
    mockSetGlobalContextManager = jest.fn();
    mockSetGlobalMeterProvider = jest.fn();
    mockNodeSDKStart = jest.fn();
    mockNodeSDKShutdown = jest.fn();
    mockMeterProviderShutdown = jest.fn();

    // Mock implementations
    (AsyncHooksContextManager as jest.Mock).mockImplementation(() => ({
      enable: mockEnable,
    }));

    (context.setGlobalContextManager as jest.Mock).mockImplementation(
      mockSetGlobalContextManager,
    );

    (metrics.setGlobalMeterProvider as jest.Mock).mockImplementation(
      mockSetGlobalMeterProvider,
    );

    (NodeSDK as jest.Mock).mockImplementation(() => ({
      start: mockNodeSDKStart,
      shutdown: mockNodeSDKShutdown,
    }));

    (MeterProvider as jest.Mock).mockImplementation(() => ({
      shutdown: mockMeterProviderShutdown,
    }));

    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const defaultOptions = {
    serviceName: 'service',
    serviceVersion: '1.0.0',
    metrics: {
      exportInterval: 10000,
      prometheusPort: 9464,
    },
  };

  it('should initialize telemetry with default options', () => {
    createTelemetryProviders(defaultOptions);

    // Verify context manager initialization
    expect(AsyncHooksContextManager).toHaveBeenCalled();
    expect(mockEnable).toHaveBeenCalled();
    expect(mockSetGlobalContextManager).toHaveBeenCalled();

    // Verify resource creation
    expect(Resource).toHaveBeenCalledWith({
      'service.name': 'service',
      'service.version': '1.0.0',
      environment: 'test',
    });

    // Verify trace exporter setup
    expect(OTLPTraceExporter).toHaveBeenCalledWith({
      url: 'http://localhost:4317',
      timeoutMillis: 15000,
      concurrencyLimit: 10,
    });

    // Verify meter provider setup
    expect(MeterProvider).toHaveBeenCalled();
    expect(mockSetGlobalMeterProvider).toHaveBeenCalled();

    // Verify SDK initialization and start
    expect(NodeSDK).toHaveBeenCalled();
    expect(mockNodeSDKStart).toHaveBeenCalled();
  });

  it('should use custom OTLP endpoint when provided', () => {
    process.env.OTLP_ENDPOINT = 'https://custom-endpoint:4317';

    createTelemetryProviders(defaultOptions);

    expect(OTLPTraceExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://custom-endpoint:4317',
      }),
    );

    delete process.env.OTLP_ENDPOINT;
  });

  it('should use custom environment when provided', () => {
    process.env.NODE_ENV = 'production';

    createTelemetryProviders(defaultOptions);

    expect(Resource).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'production',
      }),
    );

    delete process.env.NODE_ENV;
  });

  it('should use default service version when not provided', () => {
    const optionsWithoutVersion = {
      serviceName: 'test-service',
      metrics: defaultOptions.metrics,
    };

    createTelemetryProviders(optionsWithoutVersion);

    expect(Resource).toHaveBeenCalledWith(
      expect.objectContaining({
        'service.version': '1.0.0',
      }),
    );
  });

  it('should handle SIGTERM gracefully', async () => {
    createTelemetryProviders(defaultOptions);

    // Mock process.exit to prevent actual exit
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);

    // Trigger SIGTERM
    process.emit('SIGTERM');

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(mockMeterProviderShutdown).toHaveBeenCalled();
    expect(mockNodeSDKShutdown).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });

  it('should handle shutdown errors gracefully', async () => {
    // Mock shutdown to throw an error
    mockMeterProviderShutdown.mockRejectedValue(new Error('Shutdown failed'));
    mockNodeSDKShutdown.mockRejectedValue(new Error('SDK shutdown failed'));

    createTelemetryProviders(defaultOptions);

    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const mockConsoleLog = jest.spyOn(console, 'log');

    // Trigger SIGTERM
    process.emit('SIGTERM');

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Error terminating tracing',
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });

  it('should configure custom metric export interval', () => {
    const customOptions = {
      ...defaultOptions,
      metrics: {
        ...defaultOptions.metrics,
        exportInterval: 5000,
      },
    };

    createTelemetryProviders(customOptions);

    expect(PeriodicExportingMetricReader).toHaveBeenCalledWith(
      expect.objectContaining({
        exportIntervalMillis: 5000,
      }),
    );
  });

  it('should configure custom Prometheus port', () => {
    const customOptions = {
      ...defaultOptions,
      metrics: {
        ...defaultOptions.metrics,
        prometheusPort: 8080,
      },
    };

    createTelemetryProviders(customOptions);

    expect(PrometheusExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
      }),
    );
  });
});
