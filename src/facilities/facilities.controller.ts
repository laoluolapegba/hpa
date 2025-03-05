import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { OktaAuthGuard } from '@src/auth';
import {
  CreateFacilityDto,
  GetFacilitiesQueryDto,
  UpdateFacilityDto,
} from './dto';
import { CurrentUser, ICurrentUser } from '@app/common';

@Controller('facilities')
@UseGuards(OktaAuthGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  async createFacility(
    @Body() dto: CreateFacilityDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const data = await this.facilitiesService.createFacility(dto, user.id);

    return { data };
  }

  @Get()
  async getManyFacilities(@Query() query: GetFacilitiesQueryDto) {
    const data = await this.facilitiesService.getFacilities(query);

    return { data };
  }

  @Get(':id')
  async getFacility(@Param('id') id: string) {
    const data = await this.facilitiesService.getFacility(id);

    return { data };
  }

  @Patch(':id')
  async updateFacility(
    @Param('id') id: string,
    @Body() dto: UpdateFacilityDto,
  ) {
    const data = await this.facilitiesService.updateFacility(dto, id);

    return { data };
  }

  @Delete(':id')
  async deleteFacility(@Param('id') id: string) {
    const data = await this.facilitiesService.deleteFacility(id);

    return { data };
  }
}
