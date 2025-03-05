import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { DatabaseModule, FileHandlerModule } from '@app/common';
import { AuthModule } from '@src/auth';

@Module({
  imports: [DatabaseModule, FileHandlerModule, AuthModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
