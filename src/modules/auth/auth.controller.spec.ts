import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/core/utils/provide';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                provideValue(AuthService),
                provideValue(ConfigService, { getOrThrow: jest.fn().mockReturnValue('') })
            ]
        }).compile();

        controller = module.get(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
