import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [DatabaseModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
})
export class PractitionersModule {}
