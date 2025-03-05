import {
  DynamicModule,
  Global,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { TelemetryModuleOptions } from './interfaces';
import { TELEMETRY_MODULE_OPTIONS } from './constants';
import { createTelemetryProviders } from './providers';
import { TelemetryService } from './services';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({})
export class TelemetryModule implements OnApplicationBootstrap {
  static forRoot(options: TelemetryModuleOptions): DynamicModule {
    const providers = [
      {
        provide: TELEMETRY_MODULE_OPTIONS,
        useValue: options,
      },
      ...createTelemetryProviders(options),
      TelemetryService,
    ];

    return {
      module: TelemetryModule,
      providers,
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            APP_NAME: Joi.string().trim().min(1),
          }),
        }),
      ],
      exports: providers,
    };
  }

  onApplicationBootstrap() {
    console.log('Telemetry initialized');
  }
}
