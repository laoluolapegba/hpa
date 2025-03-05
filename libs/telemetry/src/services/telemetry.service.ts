import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import {
  trace,
  Span,
  SpanStatusCode,
  context,
  Meter,
  metrics,
  Counter,
  Histogram,
  UpDownCounter,
} from '@opentelemetry/api';
import { TELEMETRY_MODULE_OPTIONS } from '../constants';
import { TelemetryModuleOptions, MetricDefinition } from '../interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelemetryService implements OnApplicationShutdown {
  private readonly tracer;
  private readonly meter: Meter;
  private readonly metrics: Map<string, Counter | Histogram | UpDownCounter> =
    new Map();

  constructor(
    @Inject(TELEMETRY_MODULE_OPTIONS)
    private readonly options: TelemetryModuleOptions,
    private readonly configService: ConfigService,
  ) {
    this.tracer = trace.getTracer(
      `${this.configService.getOrThrow('APP_NAME')}-tracer`,
    );
    this.meter = metrics.getMeter(
      `${this.configService.getOrThrow('APP_NAME')}-metrics`,
    );
    this.initializeMetrics();
  }

  private initializeMetrics() {
    const allMetrics = this.options.metrics?.customMetrics ?? [];

    for (const metric of allMetrics) {
      this.createMetric(metric);
    }
  }

  private createMetric(definition: MetricDefinition) {
    const definitionOption = definition.options;
    const options = {
      description: definition.description,
      ...definitionOption,
    };
    switch (definition.type) {
      case 'counter':
        this.metrics.set(
          definition.name,
          this.meter.createCounter(definition.name, options),
        );
        break;
      case 'upDownCounter':
        this.metrics.set(
          definition.name,
          this.meter.createUpDownCounter(definition.name, options),
        );
        break;
      case 'histogram':
        this.metrics.set(
          definition.name,
          this.meter.createHistogram(definition.name, options),
        );
        break;
    }
  }

  getMetric(name: string) {
    return this.metrics.get(name);
  }

  createSpan<T>(name: string, fn: (span: Span) => Promise<T>) {
    return this.tracer.startActiveSpan(name, async (span: Span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  getTraceId(): string {
    const currentSpan = trace.getSpan(context.active());
    return currentSpan?.spanContext().traceId ?? '';
  }

  async onApplicationShutdown() {
    // Ensure proper cleanup of providers
  }
}
