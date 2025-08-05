import Joi from 'joi';
import { parseDuration } from './parse-duration/parse-duration';

export enum Config {
    NODE_ENV = 'NODE_ENV',
    PORT = 'PORT',
    DATABASE_URL = 'DATABASE_URL',

    JWT_SECRET = 'JWT_SECRET',
    JWT_EXP = 'JWT_EXP',
    JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
    JWT_REFRESH_EXP = 'JWT_REFRESH_EXP',
    JWT_VERIFY_SECRET = 'JWT_VERIFY_SECRET',
    JWT_VERIFY_EXP = 'JWT_VERIFY_EXP',

    PASSWORD_RESET_EXP = 'PASSWORD_RESET_EXP'
}

export const ConfigValidationSchema = Joi.object<{
    [K in keyof typeof Config]: Joi.SchemaLike;
}>({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    PORT: Joi.number().port().default(3000),
    DATABASE_URL: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXP: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXP: Joi.string().default('30d'),
    JWT_VERIFY_SECRET: Joi.string().required(),
    JWT_VERIFY_EXP: Joi.string().default('10m'),

    PASSWORD_RESET_EXP: Joi.custom(parseDuration).default(parseDuration('10m'))
});
