import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    Query
} from '@nestjs/common';
import { UserService } from './user.service';

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
}
