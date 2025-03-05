import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { DatabaseModule } from '@app/common';
import { AuthModule } from '@src/auth';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
