import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { RequestWithJwt } from '../../core/utils/user-decorator';
import { UserService } from './user.service';

interface UserResponse {
    id: number;
    email: string;
    username: string;
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: RequestWithJwt): Promise<UserResponse> {
        const matchingUser = await this.userService.findById(req.user.userId);

        return {
            id: matchingUser.id,
            email: matchingUser.email,
            username: matchingUser.name,
        };
    }
}
