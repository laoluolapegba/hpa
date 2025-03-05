import { Module } from '@nestjs/common';
import { LicenseApplicationsService } from './license-applications.service';
import { LicenseApplicationsController } from './license-applications.controller';
import { DatabaseModule, FileHandlerModule } from '@app/common';
import { AuthModule } from '@src/auth';

@Module({
  imports: [DatabaseModule, AuthModule, FileHandlerModule],
  controllers: [LicenseApplicationsController],
  providers: [LicenseApplicationsService],
})
export class LicenseApplicationsModule {}
