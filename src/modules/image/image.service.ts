import { Injectable } from '@nestjs/common';

export interface ImageResponse {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
}

@Injectable()
export class ImageService {
    getImage(index: number): ImageResponse {
        return {
            albumId: index,
            id: index,
            title: `Image ${index}`,
            url: `Image ${index} URL`,
            thumbnailUrl: `Image ${index} Thumbnail URL`,
        };
    }
}
