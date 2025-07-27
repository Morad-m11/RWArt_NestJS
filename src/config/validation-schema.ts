import Joi from 'joi';

export const ConfigValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    PORT: Joi.number().port().default(3000),
    JWT_SECRET: Joi.string().required(),
    JWT_EXP: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXP: Joi.string().default('30d'),
    DATABASE_URL: Joi.string().required(),
});
