import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { MailServiceMock } from 'src/mocks/mail/mail.service.mock';
import { MailService } from './mail.service';

const MailServiceOrMock = {
    provide: MailService,
    inject: [ConfigService, SITE_ORIGIN],
    useFactory: (config: ConfigService, siteOrigin: string) =>
        config.getOrThrow('NODE_ENV') === 'development'
            ? new MailServiceMock(siteOrigin, config)
            : new MailService(siteOrigin, config)
};

@Module({
    providers: [MailServiceOrMock],
    exports: [MailServiceOrMock]
})
export class MailModule {}
