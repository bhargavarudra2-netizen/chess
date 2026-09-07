import { Controller, Request, Post, UseGuards, Body, Get, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.username, req.password);
        if (!user) {
            return { error: 'Invalid credentials' };
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() req) {
        return this.authService.register(req.username, req.password, req.email);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    // GDPR: Export Data
    @UseGuards(AuthGuard('jwt'))
    @Get('export-data')
    async exportData(@Request() req) {
        // Return all user data (games, moves, profile)
        return {
            user: req.user,
            games: [], // Fetch from GameService
            message: 'Data export'
        };
    }

    // GDPR: Delete Account
    @UseGuards(AuthGuard('jwt'))
    @Delete('delete-account')
    async deleteAccount(@Request() req) {
        // Delete user and anonymize games
        return { message: 'Account deleted' };
    }
}
