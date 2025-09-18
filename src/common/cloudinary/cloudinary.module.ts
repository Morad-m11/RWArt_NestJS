// cloudinary.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryServiceMock } from 'src/mocks/cloudinary/cloudinary.service.mock';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

const CloudinaryServiceOrMock = {
    provide: CloudinaryService,
    inject: [ConfigService],
    useFactory: (config: ConfigService) =>
        config.getOrThrow('NODE_ENV') === 'development'
            ? new CloudinaryServiceMock()
            : new CloudinaryService()
};

@Module({
    exports: [CloudinaryProvider, CloudinaryServiceOrMock],
    providers: [CloudinaryProvider, CloudinaryServiceOrMock]
})
export class CloudinaryModule {}
