import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Strategy } from 'passport-custom';

type ThirdPartyProvider = 'Google';

export interface JWTDecodedThirdParty {
    provider: ThirdPartyProvider;
    providerUserId: string;
    email: string;
    username?: string;
}

export type RequestWithThirdPartyJwt = Request & {
    user: JWTDecodedThirdParty;
};

@Injectable()
export class CustomGoogleStrategy extends PassportStrategy(Strategy, 'google') {
    client = new OAuth2Client();

    constructor() {
        super();
    }

    async validate(req: Request): Promise<JWTDecodedThirdParty> {
        const requestBody = req.body as { token?: string; username?: string };
        const { token, username } = requestBody;

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        const googleUser = await this.verifyToken(token).catch((error: unknown) => {
            throw new UnauthorizedException('Token verification failed', {
                cause: error
            });
        });

        if (!googleUser.email) {
            throw new BadRequestException('Email is required but was not provided');
        }

        return {
            provider: 'Google',
            providerUserId: googleUser.sub,
            email: googleUser.email,
            username
        };
    }

    private async verifyToken(token: string): Promise<TokenPayload> {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience:
                '689533085633-ilr40pa333nhdgtahh3kpil11t0ui9ca.apps.googleusercontent.com'
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Missing payload');
        }

        return payload;
    }
}
