import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
    readonly logger = new Logger('IMAGE_SERVICE');

    constructor(private cloudinary: CloudinaryService) {}

    async upload(image: Express.Multer.File): Promise<string> {
        const response = await this.cloudinary.uploadFile(image);

        this.logger.log(`Uploaded image. Received ID ${response.public_id}`);

        return response.public_id;
    }

    async delete(imageId: string): Promise<void> {
        try {
            const response = await this.cloudinary.deleteFile(imageId);

            if (response.result !== 'ok') {
                this.logger.error(
                    `Deleting image with ID '${imageId}' failed. Response: ${JSON.stringify(response)}`
                );
            }
        } catch (error) {
            this.logger.error(
                `Deleting image with ID '${imageId}' errored. Error: ${JSON.stringify(error)}`
            );
        }
    }
}
