import { Test, TestingModule } from '@nestjs/testing';
import { provideValue } from 'src/core/provide';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
   let controller: AuthController;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         controllers: [AuthController],
         providers: [provideValue(AuthService)],
      }).compile();

      controller = module.get(AuthController);
   });

   it('should be defined', () => {
      expect(controller).toBeDefined();
   });
});
