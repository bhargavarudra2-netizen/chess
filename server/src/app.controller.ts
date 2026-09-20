import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint used by UptimeRobot to keep the Render
   * server awake (pinged every 14 minutes, preventing the 15-min sleep).
   */
  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: 'portal-chess-api',
    };
  }
}
