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

export type JWTDecoded = {
    userId: number;
    username: string;
};

export type RequestWithJwt = Request & { user: JWTDecoded };

export const RegisteredJwtModule = JwtModule.registerAsync({
    global: true,
    inject: [ConfigService],
    useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        const expiresIn = config.getOrThrow<string>('JWT_EXP');

        return {
            secret,
            signOptions: { expiresIn },
        };
    },
});
