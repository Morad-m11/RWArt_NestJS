import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/prisma.service';
import { provideEmpty, provideValue } from 'src/core/utils/provide';
import { TokenService } from './token.service';

describe('TokenService', () => {
    let service: TokenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                provideValue(ConfigService, { getOrThrow: jest.fn() }),
                ...provideEmpty(JwtService, PrismaService)
            ]
        }).compile();

        service = module.get<TokenService>(TokenService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
