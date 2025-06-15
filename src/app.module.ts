import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NameModule } from './name/name.module';

@Module({
   imports: [NameModule],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
