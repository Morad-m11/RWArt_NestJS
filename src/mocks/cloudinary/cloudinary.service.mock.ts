import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class CloudinaryServiceMock implements CloudinaryService {
    id = 0;

    async uploadFile(_file: Express.Multer.File): Promise<UploadApiResponse> {
        return Promise.resolve({
            public_id: `fakeId-${++this.id}`.toString()
        } as UploadApiResponse);
    }

    async deleteFile(_public_id: string): Promise<{ result?: string }> {
        return Promise.resolve({ result: 'ok' });
    }
}
