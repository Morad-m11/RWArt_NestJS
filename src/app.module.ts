import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfiguredWinstonLoggerModule } from './config/logging/winston.module';
import { ConfiguredConfigModule } from './config/module';
import { AuthModule } from './modules/auth/auth.module';
import { ImageModule } from './modules/image/image.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfiguredConfigModule,
        ConfiguredWinstonLoggerModule,
        AuthModule,
        UserModule,
        ImageModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
