import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './env-validation';

export const SITE_ORIGIN = Symbol('SITE_ORIGIN');

export const provideSiteOrigin = (): Provider => {
    return {
        provide: SITE_ORIGIN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
            const isProd = config.getOrThrow(Config.NODE_ENV) === 'production';
            return isProd ? 'https://www.art-shelter.org' : 'http://localhost:4200';
        }
    };
};
