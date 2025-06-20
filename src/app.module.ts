import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { UserModule } from './user/user.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      AuthModule,
      UserModule,
      ImageModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
