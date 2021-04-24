import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let model: Model<UserDocument>;
  const mockUser = { _id: 'madeUpId', toObject: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            toObject: jest.fn(),
          },
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
    model = module.get<Model<UserDocument>>(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('loginGoogle', () => {
    it('should fetch user if present', async () => {
      const spy = jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);
      const email = 'sumemail@mail.com';
      const userRet = await authService.loginGoogle(email);
      expect(spy).toHaveBeenCalledWith({ email });
      expect(mockUser.toObject).toHaveBeenCalled();
      expect(userRet.access_token).toBeDefined();
      expect(userRet.refresh_token).toBeDefined();
    });

    it('should create user if not present', async () => {
      const spyUserByEmail = jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(undefined),
      } as any);
      const spyCreateUser = jest
        .spyOn(model, 'create')
        .mockReturnValueOnce(mockUser as any);
      const email = 'sumemail@mail.com';
      const userRet = await authService.loginGoogle(email);
      expect(spyUserByEmail).toHaveBeenCalledWith({ email });
      expect(spyCreateUser).toHaveBeenCalledWith({ email });
      expect(mockUser.toObject).toHaveBeenCalled();
      expect(userRet.access_token).toBeDefined();
      expect(userRet.refresh_token).toBeDefined();
    });
  });

  describe('generateAccessToken', () => {
    it('should return access_token', () => {
      const access_token = authService.generateAccessToken(mockUser._id);
      expect(access_token).toBeDefined();
    });

    it('should return access_token when decoded contains user_id', () => {
      const access_token = authService.generateAccessToken(mockUser._id);
      const decodedAccessToken = jwtService.decode(access_token);
      expect(decodedAccessToken).toHaveProperty('user_id', mockUser._id);
    });
  });

  describe('generateRefreshToken', () => {
    it('should return refresh_token', () => {
      const refresh_token = authService.generateRefreshToken(mockUser._id);
      expect(refresh_token).toBeDefined();
    });

    it('should return access_token when decoded contains user_id', () => {
      const refresh_token = authService.generateRefreshToken(mockUser._id);
      const decodedRefreshToken = jwtService.decode(refresh_token);
      expect(decodedRefreshToken).toHaveProperty('user_id', mockUser._id);
    });
  });
});
