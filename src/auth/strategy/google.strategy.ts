import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { PinoLogger } from 'nestjs-pino';
import { OAuth2Strategy } from 'passport-google-oauth';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(OAuth2Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_AUTH_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
    logger.setContext(GoogleStrategy.name);
  }

  validate(acsToken, refToken, profile) {
    this.logger.debug(
      'accessToken(%s), refToken(%s), profile(%o)',
      acsToken,
      refToken,
      profile,
    );
    if (!profile?.emails?.[0]?.value) {
      this.logger.error('error receiving user email via Gmail');
      throw new InternalServerErrorException();
    }
    const email = profile.emails[0].value;
    return { email };
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
