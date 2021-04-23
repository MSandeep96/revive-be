import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './strategy/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectPinoLogger(AuthController.name) private readonly logger: PinoLogger,
  ) {}
  @Post('login')
  login() {
    //stub
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    //stub
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req) {
    this.logger.debug('google returned user', req.user);
    const userResponse = this.authService.loginGoogle(req.user.email);
    return userResponse;
  }
}
