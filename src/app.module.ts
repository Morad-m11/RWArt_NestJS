import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfiguredConfigModule } from './config/config.module';
import { ConfiguredLoggerModule } from './config/logging/logging.module';
import { ConfiguredThrottlerModule } from './core/throttler.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfiguredConfigModule,
        ConfiguredLoggerModule,
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
