import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Config } from 'src/core/config/env-validation';

export const CloudinaryProvider: Provider = {
    provide: 'CLOUDINARY',
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        return cloudinary.config({
            cloud_name: config.getOrThrow(Config.CLOUD_NAME),
            api_key: config.getOrThrow(Config.API_KEY),
            api_secret: config.getOrThrow(Config.API_SECRET)
        });
    }
};
