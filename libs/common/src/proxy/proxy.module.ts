import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'HTTP_PROXY_AGENT',
      useFactory: (configService: ConfigService) => {
        const proxyUrl = configService.get('HTTP_PROXY');
        const useProxy = configService.get('USE_PROXY');
        return proxyUrl && useProxy ? new HttpProxyAgent(proxyUrl) : null;
      },
      inject: [ConfigService],
    },
    {
      provide: 'HTTPS_PROXY_AGENT',
      useFactory: (configService: ConfigService) => {
        const proxyUrl = configService.get('HTTPS_PROXY');
        const useProxy = configService.get('USE_PROXY');
        return proxyUrl && useProxy ? new HttpsProxyAgent(proxyUrl) : null;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['HTTP_PROXY_AGENT', 'HTTPS_PROXY_AGENT'],
})
export class ProxyModule {}
