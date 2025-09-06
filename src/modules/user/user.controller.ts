import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Query,
    UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { UserJWT } from 'src/core/auth/jwt/jwt.module';
import { User } from 'src/shared/user/user.decorator';
import { UserService } from './user.service';

interface UserResponse {
    id: number;
    email: string;
    username: string;
    pictureUrl?: string | null;
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('check-unique')
    async checkUniqueProperties(
        @Query('username') username: string
    ): Promise<{ unique: true }> {
        if (!username) {
            throw new BadRequestException('Missing parameter username');
        }

        if (await this.userService.exists({ username })) {
            throw new ConflictException('Username is not unique');
        }

        return { unique: true };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@User() user: UserJWT): Promise<UserResponse> {
        const matchingUser = await this.userService.findOne({ id: user.id });

        if (!matchingUser) {
            throw new NotFoundException(`User with ID ${user.id} not found`);
        }

        return {
            id: matchingUser.id,
            email: matchingUser.email,
            username: matchingUser.username,
            pictureUrl: matchingUser.picture
        };
    }
}
