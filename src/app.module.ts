import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
        ThrottlerModule.forRoot([
            { name: 'short', ttl: seconds(1), limit: 3 },
            { name: 'medium', ttl: seconds(10), limit: 20 },
            { name: 'long', ttl: seconds(60), limit: 100 }
        ]),
        AuthModule,
        UserModule,
        ImageModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ]
})
export class AppModule {}
