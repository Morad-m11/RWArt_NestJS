import { Inject, Injectable } from '@nestjs/common';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { accountRecoveryHTML, tokenReusedHTML, verificationHTML } from './mail-templates';

@Injectable()
export class MailService {
    constructor(@Inject(SITE_ORIGIN) private siteOrigin: string) {}

    async sendVerificationPrompt(email: string, token: string) {
        await this.send(
            email,
            verificationHTML(`${this.siteOrigin}/auth/verify-account/${token}`)
        );
    }

    async sendAccountRecoveryPrompt(email: string, name: string, token: string) {
        await this.send(
            email,
            accountRecoveryHTML(name, `${this.siteOrigin}/auth/reset-password/${token}`)
        );
    }

    async sendTokenReusedMail(email: string, name: string) {
        await this.send(email, tokenReusedHTML(name));
    }

    async send(_email: string, _content: { subject: string; html: string }) {
        await Promise.reject(new Error('Method not implemented'));
    }
}
