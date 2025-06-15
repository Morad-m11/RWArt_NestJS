import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

export interface ImageResponse {
   albumId: number;
   id: number;
   title: string;
   url: string;
   thumbnailUrl: string;
}

@Controller()
export class AppController {
   constructor(private readonly appService: AppService) {}

   @Get('images/:index')
   getImage(@Param('index') index: string): ImageResponse {
      return this.appService.getImage(+index);
   }
}
