import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  const mockUser = { _id: 'madeUpId', getObject: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
      imports: [
        JwtModule.register({
          secret: 'madeUpSecret',
        }),
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('loginGoogle', () => {
    it('should fetch user if present', async () => {
      const spy = jest
        .spyOn(userService, 'getUserByEmail')
        .mockResolvedValueOnce(mockUser as any);
      const email = 'sumemail@mail.com';
      const userRet = await authService.loginGoogle(email);
      expect(spy).toHaveBeenCalledWith(email);
      expect(mockUser.getObject).toHaveBeenCalled();
      expect(userRet.access_token).toBeDefined();
      expect(userRet.refresh_token).toBeDefined();
    });

    it('should create user if not present', async () => {
      const spyUserByEmail = jest
        .spyOn(userService, 'getUserByEmail')
        .mockResolvedValueOnce(undefined);
      const spyCreateUser = jest
        .spyOn(userService, 'createUser')
        .mockReturnValueOnce(mockUser as any);
      const email = 'sumemail@mail.com';
      const userRet = await authService.loginGoogle(email);
      expect(spyUserByEmail).toHaveBeenCalledWith(email);
      expect(spyCreateUser).toHaveBeenCalledWith({ email });
      expect(mockUser.getObject).toHaveBeenCalled();
      expect(userRet.access_token).toBeDefined();
      expect(userRet.refresh_token).toBeDefined();
    });
  });

  describe('generateAccessTokens', () => {
    it('should return access_token and refresh_token', () => {
      const access_tokens = authService.generateAccessTokens(mockUser._id);
      expect(access_tokens.access_token).toBeDefined();
      expect(access_tokens.refresh_token).toBeDefined();
    });

    it('should return valid access_tokens', () => {
      const access_tokens = authService.generateAccessTokens(mockUser._id);
      const decodedAccessToken = jwtService.decode(access_tokens.access_token);
      expect(decodedAccessToken).toHaveProperty('user_id', mockUser._id);
      const decodedRefreshToken = jwtService.decode(
        access_tokens.refresh_token,
      );
      expect(decodedRefreshToken).toHaveProperty('user_id', mockUser._id);
    });
  });
});
