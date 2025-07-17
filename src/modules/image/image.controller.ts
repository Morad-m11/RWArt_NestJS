import { Controller, Get, Param } from '@nestjs/common';
import { ImageResponse, ImageService } from './image.service';

@Controller('image')
export class ImageController {
    constructor(private imageService: ImageService) {}

    @Get(':index')
    getImage(@Param('index') index: string): ImageResponse {
        return this.imageService.getImage(+index);
    }
}
