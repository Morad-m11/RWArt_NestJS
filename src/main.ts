import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { loggerMiddleware } from './core/logging-middleware/logging.middleware';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: {
            credentials: true,
            origin: 'http://localhost:4200',
        },
        abortOnError: false,
    });

    app.use(cookieParser());
    app.use(loggerMiddleware);

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>('PORT');

    await app.listen(port);
}

bootstrap().catch((err) => {
    console.error(`Failed to start application. ${err}`);
});
