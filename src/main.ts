import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './core/interceptors/logging/logging.interceptor';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: {
            credentials: true,
            origin: 'http://localhost:4200'
        },
        abortOnError: false
    });

    app.use(cookieParser());
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalInterceptors(new LoggingInterceptor());

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>('PORT');

    await app.listen(port);
}

bootstrap().catch((err) => {
    console.error(`Failed to start application. ${err}`);
});
