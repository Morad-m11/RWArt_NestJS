import { Controller, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/auth-guard/auth.guard';
import { JWTPayload } from 'src/core/jwt.module';
import { User } from '../../core/utils/user-decorator';
import { UserService } from './user.service';

interface UserResponse {
    id: number;
    email: string;
    username: string;
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@User() user: JWTPayload): Promise<UserResponse> {
        const matchingUser = await this.userService.findOne(user.username);

        if (!matchingUser) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: matchingUser.id,
            email: matchingUser.email,
            username: matchingUser.name,
        };
    }
}
