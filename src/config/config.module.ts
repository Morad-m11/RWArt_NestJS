import { ConfigModule } from '@nestjs/config';
import { ConfigValidationSchema } from './env-validation';

export const ConfiguredConfigModule = ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: ConfigValidationSchema,
    validationOptions: { abortEarly: true }
});
