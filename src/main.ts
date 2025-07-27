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

    await app.listen(process.env['PORT']!);
}

bootstrap().catch((err) => {
    console.error(`Failed to start application. ${err}`);
});
