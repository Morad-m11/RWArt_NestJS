import { Injectable } from '@nestjs/common';
import mailer from 'nodemailer';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class MailServiceMock extends MailService {
    override async send(email: string, content: { subject: string; html: string }) {
        this.logger.log('Sending fake mail');

        const testAccount = await mailer.createTestAccount();

        const transporter = mailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: testAccount
        });

        const sent = await transporter.sendMail({
            from: 'Me',
            to: email,
            subject: content.subject,
            html: content.html
        });

        console.log('Message sent:', sent.messageId);
        console.log('Preview URL: ', mailer.getTestMessageUrl(sent));
    }
}
