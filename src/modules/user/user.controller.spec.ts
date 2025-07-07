import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/core/auth-guard/auth.guard';
import { provideValue } from 'src/core/utils/provide';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
   let controller: UserController;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [UserController],
         providers: [provideValue(UserService)],
      })
         .overrideGuard(AuthGuard)
         .useValue({})
         .compile();

      controller = module.get<UserController>(UserController);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });
});
