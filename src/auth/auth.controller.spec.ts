import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/provide';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthController', () => {
   let controller: AuthController;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [AuthController],
         providers: [provideValue(AuthService)],
      })
         .overrideGuard(AuthGuard)
         .useValue({})
         .compile();

      controller = module.get(AuthController);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });
});
