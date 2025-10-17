// cloudinary.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/core/config/env-validation';
import { CloudinaryServiceMock } from 'src/mocks/cloudinary/cloudinary.service.mock';
import { CloudinaryConfigProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

const CloudinaryServiceOrMock = {
    provide: CloudinaryService,
    inject: [ConfigService],
    useFactory: (config: ConfigService) =>
        config.getOrThrow(Config.NODE_ENV) === 'production'
            ? new CloudinaryService()
            : new CloudinaryServiceMock()
};

@Module({
    providers: [CloudinaryConfigProvider, CloudinaryServiceOrMock],
    exports: [CloudinaryConfigProvider, CloudinaryServiceOrMock]
})
export class CloudinaryModule {}
