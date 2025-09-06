import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from 'src/common/mail/mail.service';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { provideEmpty, provideValue } from 'src/common/test-provide';
import { TokenService } from './token.service';

describe('TokenService', () => {
    let service: TokenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                provideValue(ConfigService, { getOrThrow: jest.fn() }),
                ...provideEmpty(JwtService, PrismaService, MailService)
            ]
        }).compile();

        service = module.get<TokenService>(TokenService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
