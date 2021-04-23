import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IApiGoogleLoginResponse } from './interfaces/types';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;
  const mockResp = {} as IApiGoogleLoginResponse;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
      imports: [
        JwtModule.register({
          secret: 'madeUpSecret',
        }),
        LoggerModule.forRoot(),
      ],
      controllers: [AuthController],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('googleAuthRedirect', () => {
    it('should call auth service loginGoogle', async () => {
      const spy = jest
        .spyOn(authService, 'loginGoogle')
        .mockResolvedValueOnce(mockResp);
      const request = {
        user: {
          email: 'email',
        },
      };
      const retVal = await authController.googleAuthRedirect(request);
      expect(spy).toHaveBeenCalledWith(request.user.email);
      expect(retVal).toEqual(mockResp);
    });
  });

  describe('login', () => {
    it('should be defined', () => {
      expect(authController.login).toBeDefined();
      expect(authController.login()).toBeUndefined();
    });
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(authController.googleAuth).toBeDefined();
      expect(authController.googleAuth()).toBeUndefined();
    });
  });
});
