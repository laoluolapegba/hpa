import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { IOktaUser } from './interfaces';
import { OktaService } from './okta';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oktaService: OktaService,
  ) {}

  @Get('login')
  @UseGuards(AuthGuard('okta'))
  async loginOkta() {}

  @Get('access-token')
  async getAccessToken(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('code query param expected');
    }

    const data = await this.oktaService.getAccessToken(code);

    return { data };
  }

  @Get('login/callback')
  @UseGuards(AuthGuard('okta'))
  async validateLogin(@Req() req: Request) {
    const user = await this.authService.validateOktaUser(req.user as IOktaUser);

    return user;
  }
}
