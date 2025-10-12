import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Query,
    UseGuards
} from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import { User as UserEntity } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { extract } from 'src/common/omit';
import { OptionalJwtAuthGuard } from 'src/core/auth/anonymous/anonymous.guard';
import { JwtAuthGuard } from 'src/core/auth/jwt/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

type Profile = Pick<UserEntity, 'id' | 'email' | 'username' | 'picture' | 'createdAt'>;

type OwnedProfile = Profile & {
    isSelf: true;
};

type PublicProfile = Omit<Profile, 'id' | 'email'> & {
    isSelf: false;
};

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

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':username')
    async userProfile(
        @Param('username') username: string,
        @User('id') userId: number
    ): Promise<OwnedProfile | PublicProfile> {
        const dbUser = await this.userService.findOne({ username });

        if (!dbUser) {
            throw new NotFoundException(`User ${username} not found`);
        }

        const isOwnProfile = userId && userId === dbUser.id;
        if (isOwnProfile) {
            return {
                ...extract(dbUser, 'id', 'email', 'username', 'picture', 'createdAt'),
                isSelf: true
            };
        }

        return {
            ...extract(dbUser, 'username', 'picture', 'createdAt'),
            isSelf: false
        };
    }

    @Throttle({ long: { ttl: minutes(1), limit: 3 } })
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: number, @Body() user: UpdateUserDto) {
        await this.userService.updateProfile(id, user);
    }
}
