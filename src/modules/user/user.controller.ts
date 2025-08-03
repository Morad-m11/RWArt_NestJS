import {
    BadRequestException,
    Controller,
    Get,
    NotFoundException,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { RequestWithJwt } from 'src/core/auth/jwt/jwt.module';
import { UserService } from './user.service';

interface UserResponse {
    id: number;
    email: string;
    username: string;
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('check-unique')
    async checkUniqueProperties(
        @Query('username') username: string,
        @Query('email') email: string
    ): Promise<{ unique: boolean }> {
        if (username) {
            return { unique: await this.userService.isUniqueUsername(username) };
        }

        if (email) {
            return { unique: await this.userService.isUniqueEmail(email) };
        }

        throw new BadRequestException('No parameters were provided for the unique check');
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: RequestWithJwt): Promise<UserResponse> {
        const userId = req.user.userId;

        const matchingUser = await this.userService.getById(userId).catch(() => {
            throw new NotFoundException(`User with ID ${userId} not found`);
        });

        return {
            id: matchingUser.id,
            email: matchingUser.email,
            username: matchingUser.name
        };
    }
}
