import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { provideEmpty, provideValue } from 'src/core/utils/provide';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/core/prisma.service';

describe('AuthService', () => {
   let service: AuthService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AuthService,
            ...provideEmpty(JwtService, UserService, ConfigService, PrismaService),
            provideValue(ConfigService, { getOrThrow: jest.fn() }),
         ],
      }).compile();

      service = module.get(AuthService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });
});
