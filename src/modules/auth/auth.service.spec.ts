import {
    BadRequestException,
    ForbiddenException,
    UnauthorizedException
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { mock, MockProxy } from 'jest-mock-extended';
import { MailService } from 'src/core/mail/mail.service';
import { provideValue } from 'src/core/utils/provide';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';

const USER: User = {
    id: 0,
    email: 'mail',
    username: 'name',
    passwordHash: 'hash',
    email_verified: true,
    createdAt: new Date()
};

describe('AuthService', () => {
    let service: AuthService;
    let userService: MockProxy<UserService>;
    let tokenService: MockProxy<TokenService>;
    let mailService: MockProxy<MailService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                provideValue(UserService, mock<UserService>()),
                provideValue(TokenService, mock<TokenService>()),
                provideValue(MailService, mock<MailService>())
            ]
        }).compile();

        service = module.get(AuthService);
        userService = module.get(UserService);
        tokenService = module.get(TokenService);
        mailService = module.get(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('User Validation', () => {
        beforeEach(() => {
            userService.getByName.mockResolvedValue(USER);
            jest.spyOn(service, 'comparePassword').mockResolvedValue(true);
        });

        it('should throw 401 if the user is not found', async () => {
            userService.getByName.mockRejectedValue(null);

            const fn = service.validateUser('name', 'password');
            await expect(fn).rejects.toThrow(UnauthorizedException);
        });

        it('should throw 401 if the password does not match', async () => {
            jest.spyOn(service, 'comparePassword').mockResolvedValue(false);

            const fn = service.validateUser('name', 'password');
            await expect(fn).rejects.toThrow(UnauthorizedException);
        });

        it('should return the found user on success', async () => {
            const user = await service.validateUser('name', 'password');
            expect(user).toEqual(USER);
        });

        describe('Email Verification', () => {
            beforeEach(() => {
                jest.spyOn(userService, 'getByName').mockResolvedValue({
                    ...USER,
                    email_verified: false
                });
            });

            it('should throw 403 if the email is not verified', async () => {
                const fn = service.validateUser('name', 'password');
                await expect(fn).rejects.toThrow(ForbiddenException);
            });

            it('should create a new verification token & send it via mail', async () => {
                tokenService.createVerificationToken.mockResolvedValue('token');

                const fn = service.validateUser('name', 'password');

                await expect(fn).rejects.toThrow(ForbiddenException);
                expect(tokenService.createVerificationToken).toHaveBeenCalledWith(
                    USER.id
                );
                expect(mailService.sendVerificationPrompt).toHaveBeenCalledWith(
                    USER.email,
                    USER.username,
                    'token'
                );
            });
        });
    });

    describe('Sign in', () => {
        it('should call token creation with correct parameters', async () => {
            await service.signIn(1, 'name', 'IP');

            expect(tokenService.createAccessToken).toHaveBeenCalledWith({
                sub: 1,
                username: 'name'
            });

            expect(tokenService.createRefreshToken).toHaveBeenCalledWith(1, 'IP');
        });

        it('should create access & refresh token and return them', async () => {
            tokenService.createAccessToken.mockResolvedValue('access');
            tokenService.createRefreshToken.mockResolvedValue('refresh');

            const result = await service.signIn(1, 'name', 'IP');

            expect(result).toEqual({
                accessToken: 'access',
                refreshToken: 'refresh'
            });
        });
    });

    describe('Sign up', () => {
        it('should create a user with a hashed password', async () => {
            jest.spyOn(service, 'hashPassword').mockResolvedValue('hashed');
            userService.create.mockResolvedValue(USER);

            await service.signUp({
                email: 'mail',
                username: 'name',
                password: 'pass'
            });

            expect(userService.create).toHaveBeenCalledWith({
                email: 'mail',
                username: 'name',
                passwordHash: 'hashed'
            });
        });

        it('should create a verification token', async () => {
            userService.create.mockResolvedValue(USER);

            await service.signUp({
                email: 'mail',
                username: 'name',
                password: 'pass'
            });

            expect(tokenService.createVerificationToken).toHaveBeenCalledWith(USER.id);
        });

        it('should send a verification mail', async () => {
            userService.create.mockResolvedValue(USER);
            tokenService.createVerificationToken.mockResolvedValue('token');

            await service.signUp({
                email: 'mail',
                username: 'name',
                password: 'pass'
            });

            expect(mailService.sendVerificationPrompt).toHaveBeenCalledWith(
                USER.email,
                USER.username,
                'token'
            );
        });
    });

    describe('Sign out', () => {
        it("should call to revoke the user's refresh token with a reason", async () => {
            const userId = 1;

            await service.signOut(userId);

            expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
                userId,
                'logged out'
            );
        });
    });

    describe('Verify Account', () => {
        it("should throw a 400 if the verification token isn't found", async () => {
            tokenService.findValidVerificationToken.mockRejectedValue(null);

            const fn = service.verifyAccount('token');
            await expect(fn).rejects.toThrow(BadRequestException);
        });

        it('should call to update the users verification status', async () => {
            tokenService.findValidVerificationToken.mockResolvedValue({
                userId: 1,
                tokenId: 2
            });

            await service.verifyAccount('token');

            expect(userService.update).toHaveBeenCalledWith(1, {
                email_verified: true
            });
        });

        it('should call to delete the found verification token', async () => {
            tokenService.findValidVerificationToken.mockResolvedValue({
                userId: 1,
                tokenId: 2
            });

            await service.verifyAccount('token');

            expect(tokenService.deleteVerificationToken).toHaveBeenCalledWith(2);
        });
    });

    describe('Recover Account', () => {
        it("should do nothing and not throw if the user isn't found", async () => {
            userService.getByEmail.mockRejectedValue(null);

            const fn = service.recoverAccount('mail');

            await expect(fn).resolves.not.toThrow();
            expect(tokenService.createPasswordResetToken).not.toHaveBeenCalled();
            expect(mailService.sendAccountRecoveryPrompt).not.toHaveBeenCalled();
        });

        it('should call to create a password token', async () => {
            userService.getByEmail.mockResolvedValue(USER);

            await service.recoverAccount('mail');

            expect(tokenService.createPasswordResetToken).toHaveBeenCalledWith(USER.id);
        });

        it('should call to send a recovery mail', async () => {
            userService.getByEmail.mockResolvedValue(USER);
            tokenService.createPasswordResetToken.mockResolvedValue('token');

            await service.recoverAccount('mail');

            expect(mailService.sendAccountRecoveryPrompt).toHaveBeenCalledWith(
                USER.email,
                USER.username,
                'token'
            );
        });
    });

    describe('Reset Password', () => {
        it("should throw a 400 if the reset token isn't found", async () => {
            tokenService.findValidPasswordResetToken.mockRejectedValue(null);

            const fn = service.resetPassword('token', 'new password');

            await expect(fn).rejects.toThrow(BadRequestException);
        });

        it('should call to update the users password with a hashed version', async () => {
            tokenService.findValidPasswordResetToken.mockResolvedValue({
                userId: 1,
                tokenId: 2
            });
            jest.spyOn(service, 'hashPassword').mockResolvedValue('hashed');

            await service.resetPassword('token', 'new password');

            expect(userService.update).toHaveBeenCalledWith(1, {
                passwordHash: 'hashed'
            });
        });

        it('should call to delete the reset token', async () => {
            tokenService.findValidPasswordResetToken.mockResolvedValue({
                userId: 1,
                tokenId: 2
            });

            await service.resetPassword('token', 'new password');

            expect(tokenService.deletePasswordResetToken).toHaveBeenCalledWith(2);
        });
    });

    describe('Access Token Refresh', () => {
        it("should throw a 400 if the token isn't found ", async () => {
            tokenService.findValidRefreshToken.mockRejectedValue(null);

            const fn = service.refreshAccessToken('token', 'user ip');

            await expect(fn).rejects.toThrow(BadRequestException);
        });

        it('should call to create access & refresh token', async () => {
            tokenService.findValidRefreshToken.mockResolvedValue({
                userId: 1,
                username: 'name'
            });

            await service.refreshAccessToken('token', 'user IP');

            expect(tokenService.createAccessToken).toHaveBeenCalledWith({
                sub: 1,
                username: 'name'
            });

            expect(tokenService.createRefreshToken).toHaveBeenCalledWith(1, 'user IP');
        });

        it('should return created access & refresh tokens', async () => {
            tokenService.findValidRefreshToken.mockResolvedValue({
                userId: 1,
                username: 'name'
            });
            tokenService.createAccessToken.mockResolvedValue('access');
            tokenService.createRefreshToken.mockResolvedValue('refresh');

            const tokens = await service.refreshAccessToken('token', 'user IP');

            expect(tokens).toEqual({
                accessToken: 'access',
                refreshToken: 'refresh'
            });
        });
    });
});
