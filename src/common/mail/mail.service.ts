import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { Config } from 'src/core/config/env-validation';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { accountRecoveryHTML, tokenReusedHTML, verificationHTML } from './mail-templates';

@Injectable()
export class MailService {
    // readonly transporter: Transporter;
    readonly logger = new Logger('EMAIL');
    readonly config: { sender: string; apiKey: string; apiUrl: string };

    constructor(
        @Inject(SITE_ORIGIN) private siteOrigin: string,
        private configService: ConfigService
    ) {
        this.config = {
            sender: `Art Shelter <${this.configService.getOrThrow<string>(Config.EMAIL_SENDER)}>`,
            apiUrl: this.configService.getOrThrow<string>(Config.EMAIL_URL),
            apiKey: this.configService.getOrThrow<string>(Config.EMAIL_API_KEY)
        };

        // this.transporter = mailer.createTransport({
        //     host: this.config.getOrThrow<string>(Config.EMAIL_HOST),
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: this.config.getOrThrow<string>(Config.EMAIL_USER),
        //         pass: this.config.getOrThrow<string>(Config.EMAIL_PASS)
        //     }
        // });
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
        const { sender, apiUrl, apiKey } = this.config;

        try {
            const mailgun = new Mailgun(FormData);
            const client = mailgun.client({
                username: 'api',
                key: apiKey,
                url: apiUrl
            });

            const data = await client.messages.create('art-shelter.org', {
                from: sender,
                to: email,
                subject: content.subject,
                html: content.html
            });

            this.logger.log(`Message sent: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
