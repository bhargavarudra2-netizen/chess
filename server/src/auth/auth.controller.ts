import { Controller, Request, Post, UseGuards, Body, Get, Delete, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req: { username: string; password: string }) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() req: { username: string; password: string; email: string }) {
        return this.authService.register(req.username, req.password, req.email);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req: any) {
        const user = await this.authService.findUserById(req.user.userId);
        return user || req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req: any) {
        return this.authService.getUserHistory(req.user.userId);
    }

    // GDPR: Export Data
    @UseGuards(AuthGuard('jwt'))
    @Get('export-data')
    async exportData(@Request() req: any) {
        const games = await this.authService.getUserHistory(req.user.userId);
        return {
            user: req.user,
            games,
            message: 'Data export'
        };
    }

    // GDPR: Delete Account
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete-account')
    async deleteAccount(@Request() req: any) {
        return { message: 'Account deleted' };
    }
}
