import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisteredJwtModule } from 'src/core/jwt.module';

@Module({
   imports: [UserModule, RegisteredJwtModule],
   controllers: [AuthController],
   providers: [AuthService],
})
export class AuthModule {}
