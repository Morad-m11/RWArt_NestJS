import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import winstonDailyRotate from 'winston-daily-rotate-file';
import { Config } from '../env-validation';

type PrintfCallback = Parameters<typeof winston.format.printf>[0];
type PrintfParameters = Parameters<PrintfCallback>[0];
type ExtendedPrintfParameters = PrintfParameters & {
    message: string;
    context: string;
    timestamp: string;
    ms: string;
    [key: string]: unknown;
};

const rotatingFileConfig = (path: string, level: string) => {
    return new winstonDailyRotate({
        filename: `${path}/%DATE%-combined.log`,
        level,
        zippedArchive: false,
        datePattern: 'YYYY-MM-DD',
        maxSize: '25m',
        maxFiles: '30d',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.printf((info) => {
                const { level, context, message, timestamp, ms, ...rest } =
                    info as ExtendedPrintfParameters;
                const fallback = Object.keys(rest).length ? JSON.stringify(rest) : '';
                return `[${timestamp}] ${level.toUpperCase()} [${context ?? 'App'}] ${message ?? fallback} (${ms})`;
            })
        )
    });
};

const consoleConfig = (level: string) => {
    return new winston.transports.Console({
        level,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('App')
        )
    });
};

export const ConfiguredLoggerModule = WinstonModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const path = config.getOrThrow<string>(Config.LOG_PATH);
        const level = config.getOrThrow<string>(Config.LOG_LEVEL);
        const isProd = config.getOrThrow<string>(Config.NODE_ENV) === 'production';

        const transports = [
            consoleConfig(level),
            ...(isProd ? [rotatingFileConfig(path, level)] : [])
        ];

        return { transports };
    }
});
