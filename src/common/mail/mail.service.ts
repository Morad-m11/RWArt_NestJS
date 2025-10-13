import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mailer, { Transporter } from 'nodemailer';
import { Config } from 'src/core/config/env-validation';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { accountRecoveryHTML, tokenReusedHTML, verificationHTML } from './mail-templates';

@Injectable()
export class MailService {
    readonly transporter: Transporter;
    readonly sender: string;
    readonly logger = new Logger('EMAIL');

    constructor(
        @Inject(SITE_ORIGIN) private siteOrigin: string,
        private config: ConfigService
    ) {
        const sender = this.config.getOrThrow<string>(Config.EMAIL_USER);
        this.sender = `Art Shelter <${sender}>`;

        this.transporter = mailer.createTransport({
            host: this.config.getOrThrow<string>(Config.EMAIL_HOST),
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.config.getOrThrow<string>(Config.EMAIL_USER),
                pass: this.config.getOrThrow<string>(Config.EMAIL_PASS)
            }
        });
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
        const sent = (await this.transporter.sendMail({
            from: this.sender,
            to: email,
            subject: content.subject,
            html: content.html
        })) as { messageId: string };

        this.logger.log(`Message sent: ${sent.messageId}`);
    }
}
