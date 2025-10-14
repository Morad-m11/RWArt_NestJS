import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigValidationSchema } from './core/config/env-validation';
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
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: ConfigValidationSchema,
            validationOptions: { abortEarly: true }
        }),
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
