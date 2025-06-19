import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
   let service: AuthService;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [UsersService, AuthService, { provide: JwtService, useValue: {} }],
      }).compile();

      service = module.get(AuthService);
   });

   it('should be defined', () => {
      expect(service).toBeDefined();
   });
});
