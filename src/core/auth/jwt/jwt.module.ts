import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

export const ConfiguredJwtModule = JwtModule.registerAsync({
    global: true,
    inject: [ConfigService],
    useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        const expiresIn = config.getOrThrow<string>('JWT_EXP');

        return {
            secret,
            signOptions: { expiresIn }
        };
    }
});
