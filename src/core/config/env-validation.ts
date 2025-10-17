import Joi from 'joi';
import { parseDuration } from './parse-duration/parse-duration';

const PINO_LOG_lEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

export enum Config {
    NODE_ENV = 'NODE_ENV',
    PORT = 'PORT',
    DATABASE_URL = 'DATABASE_URL',

    JWT_SECRET = 'JWT_SECRET',
    JWT_EXP = 'JWT_EXP',

    VERIFCATION_TOKEN_EXP = 'VERIFCATION_TOKEN_EXP',
    REFRESH_TOKEN_EXP = 'REFRESH_TOKEN_EXP',
    PASSWORD_RESET_EXP = 'PASSWORD_RESET_EXP',

    LOG_PATH = 'LOG_PATH',
    LOG_LEVEL = 'LOG_LEVEL',

    CLOUD_NAME = 'CLOUD_NAME',
    API_KEY = 'API_KEY',
    API_SECRET = 'API_SECRET',

    EMAIL_HOST = 'EMAIL_HOST',
    EMAIL_USER = 'EMAIL_USER',
    EMAIL_PASS = 'EMAIL_PASS'
}

export const ConfigValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production')
        .default('development'),
    PORT: Joi.number().port().default(3000),
    DATABASE_URL: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXP: Joi.string().default('15m'),

    REFRESH_TOKEN_EXP: Joi.custom(parseDuration).default(parseDuration('30d')),
    VERIFCATION_TOKEN_EXP: Joi.custom(parseDuration).default(parseDuration('10m')),
    PASSWORD_RESET_EXP: Joi.custom(parseDuration).default(parseDuration('10m')),

    LOG_PATH: Joi.string().default('./logs'),
    LOG_LEVEL: Joi.valid(...PINO_LOG_lEVELS).default('info'),

    CLOUD_NAME: Joi.string().required(),
    API_KEY: Joi.string().required(),
    API_SECRET: Joi.string().required(),

    EMAIL_HOST: Joi.string().required(),
    EMAIL_USER: Joi.string().required(),
    EMAIL_PASS: Joi.string().required()
});
