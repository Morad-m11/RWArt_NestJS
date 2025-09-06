import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { provideValue } from 'src/common/test-provide';
import { ImageService } from './image.service';

describe('ImageUploadService', () => {
    let service: ImageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageService, provideValue(CloudinaryService)]
        }).compile();

        service = module.get<ImageService>(ImageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
