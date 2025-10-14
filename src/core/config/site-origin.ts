import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const SITE_ORIGIN = Symbol('SITE_ORIGIN');

export const provideSiteOrigin = (): Provider => {
    return {
        provide: SITE_ORIGIN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
            const isDevMode = config.getOrThrow('NODE_ENV') === 'development';
            return isDevMode ? 'http://localhost:4200' : 'https://www.art-shelter.org';
        }
    };
};
