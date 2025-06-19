import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const jwtConfigFactory = (config: ConfigService): JwtModuleOptions => {
   const secret = config.get<string>('JWT_SECRET');
   const expiresIn = config.get<string>('JWT_EXPIRATION') || '15m';

   if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
   }

   return { secret, signOptions: { expiresIn } };
};

@Module({
   imports: [
      UserModule,
      JwtModule.registerAsync({
         global: true,
         inject: [ConfigService],
         useFactory: jwtConfigFactory,
      }),
   ],
   controllers: [AuthController],
   providers: [AuthService],
})
export class AuthModule {}
