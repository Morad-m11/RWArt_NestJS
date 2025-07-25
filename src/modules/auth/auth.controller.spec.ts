import { Test, TestingModule } from '@nestjs/testing';
import { provideEmpty } from 'src/core/utils/provide';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: provideEmpty(AuthService),
        }).compile();

        controller = module.get(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
