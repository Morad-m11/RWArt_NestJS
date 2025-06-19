import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AuthGuard } from 'src/core/auth.guard';

describe('UserController', () => {
   let controller: UserController;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [UserController],
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
