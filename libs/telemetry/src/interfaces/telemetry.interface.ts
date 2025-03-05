import { MetricOptions } from '@opentelemetry/api';

export interface TelemetryModuleOptions {
  serviceName: string;
  serviceVersion?: string;
  environment?: 'production' | 'development' | 'staging';
  metrics?: {
    prometheusPort?: number;
    customMetrics?: MetricDefinition[];
    exportInterval?: number;
  };
  exporters?: {
    otlp?: {
      endpoint?: string;
      protocol?: 'grpc' | 'http';
    };
    prometheus?: boolean;
  };
}

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'upDownCounter' | 'histogram';
  description: string;
  options?: MetricOptions;
}
