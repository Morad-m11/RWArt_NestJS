import { Test, TestingModule } from '@nestjs/testing';
import { SITE_ORIGIN } from 'src/core/config/site-origin';
import { provideValue } from '../test-provide';
import { MailService } from './mail.service';

describe('MailService', () => {
    let service: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MailService, provideValue(SITE_ORIGIN, 'test origin')]
        }).compile();

        service = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
