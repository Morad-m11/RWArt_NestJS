import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const SITE_ORIGIN = Symbol('SITE_ORIGIN');

export const provideSiteOrigin = (): Provider => {
    return {
        provide: SITE_ORIGIN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
            const isDevMode = config.getOrThrow('NODE_ENV') === 'development';

            if (!isDevMode) {
                throw new Error('Missing Origin URL for production mode');
            }

            return isDevMode ? 'http://localhost:4200' : '';
        }
    };
};
