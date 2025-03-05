import { Controller, Post, Body } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';

@Controller('practitioners')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}

  @Post()
  async create(@Body() createPractitionerDto: CreatePractitionerDto) {
    const data = await this.practitionersService.createPractitioner(
      createPractitionerDto,
    );

    return { data };
  }
}
