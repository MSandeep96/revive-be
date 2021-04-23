import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { AuthService } from '../auth.service';
import { GoogleStrategy } from './google.strategy';

describe('google strategy', () => {
  let googleStrategy: GoogleStrategy;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({}),
        LoggerModule.forRoot({}),
        JwtModule.register({
          secret: 'madeUpSecret',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        GoogleStrategy,
      ],
    }).compile();
    googleStrategy = moduleRef.get<GoogleStrategy>(GoogleStrategy);
  });
  it('throws error if profile is undefined', () => {
    const invalidProfile = {};
    expect(() =>
      googleStrategy.validate('gibber', 'gabber', invalidProfile),
    ).toThrowError();
  });

  it('throws error if profile has no emails', () => {
    const invalidProfile = { emails: [] };
    expect(() =>
      googleStrategy.validate('gibber', 'gabber', invalidProfile),
    ).toThrowError();
  });

  it('throws error if profile has no email value', () => {
    const invalidProfile = { emails: [{}] };
    expect(() =>
      googleStrategy.validate('gibber', 'gabber', invalidProfile),
    ).toThrowError();
  });

  it('returns object with user email', () => {
    const validProfile = { emails: [{ value: 'sumemail@mail.com' }] };
    expect(googleStrategy.validate('gibber', 'gabber', validProfile)).toEqual({
      email: 'sumemail@mail.com',
    });
  });
});
