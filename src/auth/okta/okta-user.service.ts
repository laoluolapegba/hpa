import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { CreateOktaUserDto, CreateOktaUserResponseDto } from '../dto/okta.dto';
import { CustomLogger } from '@app/common';
import * as OktaJwtVerifier from '@okta/jwt-verifier';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

@Injectable()
export class OktaService {
  private readonly logger = new CustomLogger(OktaService.name);
  private readonly jwtVerifier: OktaJwtVerifier;
  private readonly oktaDomain: string;
  private readonly oktaApiToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly issuer: string;
  private readonly oktaTokenUrl: string;
  private readonly callbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.oktaDomain = this.configService.getOrThrow('OKTA_DOMAIN');
    this.oktaApiToken = this.configService.getOrThrow('OKTA_API_TOKEN');
    this.issuer = this.configService.getOrThrow('OKTA_ISSUER');
    this.clientId = this.configService.getOrThrow('OKTA_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow('OKTA_CLIENT_SECRET');
    this.oktaTokenUrl = `${this.issuer}/v1/token`;
    this.callbackUrl = this.configService.getOrThrow('OKTA_CALLBACK_URL');

    this.jwtVerifier = new OktaJwtVerifier({
      issuer: this.issuer,
      clientId: this.clientId,
    });
  }

  async getAccessToken(authorizationCode: string) {
    try {
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.callbackUrl,
      });

      const { data } = await firstValueFrom(
        this.handleObservable(
          this.httpService.post<{
            access_token: string;
            refresh_token: string;
            expires_in: number;
          }>(this.oktaTokenUrl, formData.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          }),
        ),
      );

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }

      this.logger.logError(err, 'Error getting access token');
      throw new InternalServerErrorException();
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const { data } = await firstValueFrom(
        this.handleObservable(
          this.httpService.post<{
            access_token: string;
            refresh_token?: string;
            expires_in: number;
          }>(this.oktaTokenUrl, formData.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }),
        ),
      );

      return data;
    } catch (error) {
      this.logger.logError(error, 'Error refreshing access token');
      throw new UnprocessableEntityException();
    }
  }
  async verifyToken(token: string) {
    try {
      return await this.jwtVerifier.verifyAccessToken(
        token,
        this.configService.getOrThrow('OKTA_AUDIENCE'),
      );
    } catch (error) {
      this.logger.logError(error, 'Error verifying okta access token');
      return null;
    }
  }

  async createUser(oktaUser: CreateOktaUserDto) {
    const { data } = await firstValueFrom(
      this.handleObservable(
        this.httpService.post<CreateOktaUserResponseDto>(
          `${this.oktaDomain}/api/v1/users?active=true`,
          oktaUser,
          {
            headers: {
              Authorization: `SSWS ${this.oktaApiToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );
    return data;
  }

  async updateUser(
    oktaId: string,
    updates: Partial<CreateOktaUserDto['profile']>,
  ) {
    const { data } = await firstValueFrom(
      this.handleObservable(
        this.httpService.post<CreateOktaUserResponseDto>(
          `${this.oktaDomain}/api/v1/users/${oktaId}`,
          { profile: updates },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `SSWS ${this.oktaApiToken}`,
            },
          },
        ),
      ),
    );

    return data;
  }

  async deleteUser(oktaId: string) {
    const { data, status } = await firstValueFrom(
      this.handleObservable(
        this.httpService.delete(`${this.oktaDomain}/api/v1/users/${oktaId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `SSWS ${this.oktaApiToken}`,
          },
        }),
      ),
    );

    if (status !== 204) {
      this.logger.log('Error deleting okta user', data);
      throw new BadRequestException();
    }

    return true;
  }

  private handleObservable<T>(observable: Observable<T>) {
    return observable.pipe(
      catchError((error) => {
        if (isAxiosError(error)) {
          switch (error.response?.status) {
            case 400:
              this.logger.logError(error, 'Bad okta request', {
                data: error.response.data,
              });
              return throwError(() => new BadRequestException());
            case 403:
              return throwError(() => new ForbiddenException('Forbidden'));
            case 404:
              return throwError(
                () => new NotFoundException('Resource not found'),
              );
            default:
              this.logger.logError(error, 'Error running okta http request', {
                data: error.response?.data,
              });
              return throwError(
                () => new InternalServerErrorException('An error occured'),
              );
          }
        }

        this.logger.logError(error, 'Okta error');
        return throwError(
          () => new InternalServerErrorException('An error occurred'),
        );
      }),
    );
  }
}
