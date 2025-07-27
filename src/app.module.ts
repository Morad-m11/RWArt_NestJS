import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisteredConfigModule } from './config/module';
import { AuthModule } from './modules/auth/auth.module';
import { ImageModule } from './modules/image/image.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [RegisteredConfigModule, AuthModule, UserModule, ImageModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
