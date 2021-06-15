import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    this.logger.debug('google returned user', req.user);
    const userResponse = await this.authService.loginGoogle(req.user.email);
    const url = new URL(
      'https://msandeep96-revive-fe-c7mf-3000.githubpreview.dev/',
    );
    url.searchParams.set('t', userResponse.access_token);
    url.searchParams.set('r_t', userResponse.refresh_token);
    res.redirect(url.toString());
  }

  @Put('refresh')
  async refreshAuthToken(@Body() body) {
    return await this.authService.refreshAuthToken(body);
  }
}
