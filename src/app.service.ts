import { Injectable } from '@nestjs/common';
import { ImageResponse } from './app.controller';

@Injectable()
export class AppService {
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
