import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { provideValue } from 'src/core/utils/provide';
import { JwtAuthGuard } from './jwt.guard';

describe('AuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [JwtAuthGuard, provideValue(JwtService)]
        }).compile();

        guard = await module.resolve(JwtAuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
});
