import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryServiceMock {
    id = 0;

    async uploadFile(_file: Express.Multer.File): Promise<UploadApiResponse> {
        return Promise.resolve({
            public_id: (++this.id).toString()
        } as UploadApiResponse);
    }
}
