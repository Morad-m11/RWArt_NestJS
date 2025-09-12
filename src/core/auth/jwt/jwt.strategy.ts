import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUserClaims } from 'src/common/decorators/user.decorator';

interface JWTPayload {
    /** user id */
    sub: number;

    /** user name */
    username: string;

    /** issued at */
    iat: number;

    /** expires at */
    exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_SECRET')
        });
    }

    validate(payload: JWTPayload): JwtUserClaims {
        return { id: payload.sub, username: payload.username };
    }
}
