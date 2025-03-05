import { Provider } from '@nestjs/common';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_VERSION,
  ATTR_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { metrics, context } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { TelemetryModuleOptions } from '../interfaces';

export const createTelemetryProviders = (
  options: TelemetryModuleOptions,
): Provider[] => {
  const contextManager = new AsyncHooksContextManager();
  contextManager.enable();

  context.setGlobalContextManager(contextManager);

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: options.serviceName,
    [ATTR_SERVICE_VERSION]: options.serviceVersion ?? '1.0.0',
    environment: process.env['NODE_ENV'] ?? 'development',
  });

  const traceExporter = new OTLPTraceExporter({
    url: process.env['OTLP_ENDPOINT'] ?? 'http://localhost:4317',
    timeoutMillis: 15000, // 15 seconds
    concurrencyLimit: 10,
  });

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: process.env['OTLP_ENDPOINT'] ?? 'http://localhost:4317',
        }),
        exportIntervalMillis: options.metrics?.exportInterval ?? 10000,
      }),
      new PrometheusExporter({
        port: options.metrics?.prometheusPort ?? 9464,
      }),
    ],
  });

  metrics.setGlobalMeterProvider(meterProvider);

  const sdk = new NodeSDK({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new PinoInstrumentation(),
      new PrismaInstrumentation(),
    ],
    resource,
    traceExporter,
    spanProcessors: [
      new BatchSpanProcessor(traceExporter, {
        maxQueueSize: 2048, // Maximum queue size
        maxExportBatchSize: 512, // Maximum batch size
        scheduledDelayMillis: 5000, // Delay between exports
        exportTimeoutMillis: 30000,
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    Promise.all([meterProvider.shutdown(), sdk.shutdown()])
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return [];
};
