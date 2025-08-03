import { Injectable } from '@nestjs/common';
import mailer from 'nodemailer';
import { createAccountRecoveryHTML, createVerificationHTML } from './message-template';

@Injectable()
export class MailService {
    async sendVerificationPrompt(email: string, name: string, token: string) {
        const message = createVerificationHTML(name, token);
        await this.send(email, message);
    }

    async sendAccountRecoveryPrompt(email: string, name: string, token: string) {
        const message = createAccountRecoveryHTML(name, token);
        await this.send(email, message);
    }

    private async send(email: string, messageHTML: string) {
        const account = await mailer.createTestAccount();

        const transporter = mailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: account
        });

        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
            to: email,
            subject: 'Hello ✔',
            html: messageHTML
        });

        console.log('Message sent:', info.messageId);
        console.log('Preview URL: ', mailer.getTestMessageUrl(info));
    }
}
