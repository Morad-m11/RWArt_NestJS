import { Test } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { provideValue } from 'src/core/provide';

describe('AuthGuard', () => {
   let guard: AuthGuard;

   beforeEach(async () => {
      const module = await Test.createTestingModule({
         providers: [AuthGuard, provideValue(JwtService)],
      }).compile();

      guard = await module.resolve(AuthGuard);
   });

   it('should be defined', () => {
      expect(guard).toBeDefined();
   });
});
