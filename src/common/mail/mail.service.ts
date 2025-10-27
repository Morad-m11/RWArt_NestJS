import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Config } from 'src/core/config/env-validation';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { accountRecoveryHTML, tokenReusedHTML, verificationHTML } from './mail-templates';

@Injectable()
export class MailService {
    readonly logger = new Logger('EMAIL');
    readonly sender: string;
    readonly resend: Resend;

    constructor(
        @Inject(SITE_ORIGIN) private siteOrigin: string,
        configService: ConfigService
    ) {
        const apiKey = configService.getOrThrow<string>(Config.EMAIL_API_KEY);
        const sender = `Art Shelter <${configService.getOrThrow<string>(Config.EMAIL_SENDER)}>`;

        this.sender = sender;
        this.resend = new Resend(apiKey);
    }

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

    async send(email: string, content: { subject: string; html: string }) {
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.sender,
                to: email,
                subject: content.subject,
                html: content.html
            });

            if (error) {
                this.logger.error(error);
            }

            this.logger.log(`Message sent: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
