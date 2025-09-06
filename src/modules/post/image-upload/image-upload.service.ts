import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageUploadService {
    async upload(_image: Express.Multer.File): Promise<string> {
        return Promise.resolve('random url');
    }
}
