import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/common/test-provide';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [provideValue(UserService)]
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({})
            .compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
