import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
    constructor(private cloudinary: CloudinaryService) {}

    async upload(image: Express.Multer.File): Promise<string> {
        const response = await this.cloudinary.uploadFile(image);
        return response.public_id;
    }
}
