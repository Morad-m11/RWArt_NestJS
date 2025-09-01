import {
    BadRequestException,
    ConflictException,
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
    pictureUrl?: string | null;
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('check-unique')
    async checkUniqueProperties(
        @Query('username') username: string,
        @Query('email') email: string
    ): Promise<{ unique: true }> {
        if ((!username && !email) || (username && email)) {
            throw new BadRequestException(
                'Exactly one parameter (username or email) must be provided'
            );
        }

        const isUnique = username
            ? await this.userService.isUniqueUsername(username)
            : await this.userService.isUniqueEmail(email);

        if (!isUnique) {
            throw new ConflictException(
                `${username ? 'Username' : 'Email'} is not unique`
            );
        }

        return { unique: true };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req: RequestWithJwt): Promise<UserResponse> {
        const matchingUser = await this.userService.findById(req.user.userId);

        if (!matchingUser) {
            throw new NotFoundException(`User with ID ${req.user.userId} not found`);
        }

        return {
            id: matchingUser.id,
            email: matchingUser.email,
            username: matchingUser.username,
            pictureUrl: matchingUser.picture
        };
    }
}
