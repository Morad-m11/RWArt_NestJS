import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

export interface JWTPayload {
    /** user id */
    sub: number;

    username: string;

    /** issued at */
    iat: number;

    /** expires at */
    exp: number;
}

export const RegisteredJwtModule = JwtModule.registerAsync({
    global: true,
    inject: [ConfigService],
    useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
        const expiresIn = config.getOrThrow<string>('JWT_ACCESS_EXPIRATION');

        return {
            secret,
            signOptions: { expiresIn },
        };
    },
});
