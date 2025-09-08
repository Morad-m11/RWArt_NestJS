import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(
                        new Error('Cloudinary upload failed', { cause: error })
                    );
                }

                if (!result) {
                    return reject(new Error('Cloudinary upload returned no result'));
                }

                resolve(result);
            });

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
