import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OktaStrategy } from './strategies';
import { OktaAuthGuard } from './guards';
import { OktaService } from './okta';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';

@Module({
  imports: [PassportModule, HttpModule, DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, OktaAuthGuard, OktaStrategy, OktaService],
  exports: [OktaService, AuthService],
})
export class AuthModule {}
