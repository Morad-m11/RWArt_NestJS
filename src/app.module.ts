import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfiguredWinstonLoggerModule } from './config/logging/winston.module';
import { ConfiguredConfigModule } from './config/module';
import { ConfiguredThrottlerModule } from './core/throttler.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfiguredConfigModule,
        ConfiguredWinstonLoggerModule,
        ConfiguredThrottlerModule,
        AuthModule,
        UserModule,
        PostModule
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
