import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfiguredConfigModule } from './core/config/config.module';
import { ConfiguredLoggerModule } from './core/logging/logging.module';
import {
    ConfiguredThrottlerModule,
    provideThrottlerGuard
} from './core/throttler.module';
import { GlobalModule } from './global.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfiguredConfigModule,
        ConfiguredLoggerModule,
        ConfiguredThrottlerModule,
        GlobalModule,
        AuthModule,
        UserModule,
        PostModule,
        FeedbackModule
    ],
    controllers: [AppController],
    providers: [AppService, provideThrottlerGuard()]
})
export class AppModule {}
