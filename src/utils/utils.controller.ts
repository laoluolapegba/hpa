import { Controller, Get, Param } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('academic-qualifications')
  async getManyAcademicQualifications() {
    const academicQualifications =
      await this.utilsService.getManyAcademiQualifications();

    return { data: { academicQualifications } };
  }

  @Get('approving-authorities')
  async getManyApprovingAuthority() {
    const approvingAuthorities =
      await this.utilsService.getManyApprovingAuthority();

    return { data: { approvingAuthorities } };
  }

  @Get('energy-sources')
  async getManyEnergySources() {
    const energySources = await this.utilsService.getManyEnergySources();

    return { data: { energySources } };
  }

  @Get('general-occupations')
  async getManyGeneralOccupation() {
    const generalOccupations =
      await this.utilsService.getManyGeneralOccupation();

    return { data: { generalOccupations } };
  }

  @Get('human-waste-disposal-methods')
  async getManyHumanWasteDisposalMethods() {
    const humanWasteDisposalMethods =
      await this.utilsService.getManyHumanWasteDisposalMethod();

    return { data: { humanWasteDisposalMethods } };
  }

  @Get('medical-waste-disposal-methods')
  async getManyMedicalWasteDisposalMethods() {
    const medicalWasteDisposalMethods =
      await this.utilsService.getManyMedicalWasteDisposalMethod();

    return { data: { medicalWasteDisposalMethods } };
  }

  @Get('refuse-disposal-methods')
  async getManyRefuseDisposalMethods() {
    const refuseDisposalMethods =
      await this.utilsService.getManyRefuseDisposalMethod();

    return { data: { refuseDisposalMethods } };
  }

  @Get('water-sources')
  async getManyWaterSources() {
    const waterSources = await this.utilsService.getManyWaterSource();

    return { data: { waterSources } };
  }

  @Get('facility-categories')
  async getManyFacilityCategories() {
    const facilityCategories =
      await this.utilsService.getManyFacilityCategories();

    return { data: { facilityCategories } };
  }

  @Get('health-services')
  async getManyHealthService() {
    const healthServices = await this.utilsService.getManyHealthServices();

    return { data: { healthServices } };
  }

  @Get('health-services/:id/features')
  async getHealthServiceFeatures(@Param('id') id: string) {
    const features = await this.utilsService.getHealthServiceFeatures(id);

    return { data: { features } };
  }

  @Get('practitioner-licence-bodies')
  async getPractitionerLicenseBodies() {
    const licenseBodies =
      await this.utilsService.getPractitionerLicenseBodies();

    return { data: { licenseBodies } };
  }

  @Get('countries')
  async getCountries() {
    const countries = await this.utilsService.getCountries();

    return { data: { countries } };
  }

  @Get('lga-lcdas')
  async getLocalGovernmentLCDAs() {
    const localGovernmentLCDAs =
      await this.utilsService.getLocalGovernmentLCDAs();

    return { data: { localGovernmentLCDAs } };
  }

  @Get('building-types')
  async getBuildingTypes() {
    const buildingTypes = await this.utilsService.getBuildingTypes();

    return { data: { buildingTypes } };
  }
}
