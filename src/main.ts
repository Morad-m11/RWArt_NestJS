import { Logger, LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/prisma/filter/prisma.filter';
import { Config } from './core/config/env-validation';
import { SITE_ORIGIN } from './core/config/site-origin';
import { LoggingInterceptor } from './core/logging/interceptor/logging.interceptor';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        abortOnError: false
    });

    const siteOrigin = app.get<string>(SITE_ORIGIN);
    const logProvider = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
    const config = app.get(ConfigService);
    const env = config.getOrThrow<string>(Config.NODE_ENV);
    const port = config.getOrThrow<number>(Config.PORT);

    app.enableCors({
        credentials: true,
        origin: siteOrigin,
        exposedHeaders: ['Retry-After-Long', 'Retry-After-Medium', 'X-Total-Count']
    });

    app.use(cookieParser());
    app.useLogger(logProvider);
    app.useGlobalFilters(new PrismaClientExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true }
        })
    );

    await app.listen(port);
    const logger = new Logger('Bootstrap');
    logger.log(`App running for '${env}' on ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
    console.error(`Failed to start application. ${err}`);
});
