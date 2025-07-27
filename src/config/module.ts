import { ConfigModule } from '@nestjs/config';
import { ConfigValidationSchema } from './validation-schema';

export const RegisteredConfigModule = ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: ConfigValidationSchema,
    validationOptions: { abortEarly: true },
});
