import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

export const RegisteredJwtModule = JwtModule.registerAsync({
   global: true,
   inject: [ConfigService],
   useFactory: (config: ConfigService): JwtModuleOptions => {
      const secret = config.get<string>('JWT_SECRET');
      const expiresIn = config.get<string>('JWT_EXPIRATION') || '15m';

      if (!secret) {
         throw new Error('JWT_SECRET is not defined in the environment variables');
      }

      return { secret, signOptions: { expiresIn } };
   },
});
