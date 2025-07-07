import { Module } from '@nestjs/common';
import { RegisteredJwtModule } from 'src/core/jwt.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/core/prisma.service';

@Module({
   imports: [UserModule, RegisteredJwtModule],
   controllers: [AuthController],
   providers: [AuthService, PrismaService],
})
export class AuthModule {}
