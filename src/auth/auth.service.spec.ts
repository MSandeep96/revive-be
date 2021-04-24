import { ConfigModule, ConfigService } from '@nestjs/config';
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
  let configService: ConfigService;
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
        ConfigModule.forRoot({
          envFilePath: '.test.env',
        }),
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
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
      const spyGenerateAccessToken = jest.spyOn(
        authService,
        'generateAccessToken',
      );
      const email = 'sumemail@mail.com';
      const userRet = await authService.loginGoogle(email);
      expect(spyGenerateAccessToken).toHaveBeenCalledTimes(2);
      expect(spyUserByEmail).toHaveBeenCalledWith({ email });
      expect(spyCreateUser).toHaveBeenCalledWith({ email });
      expect(mockUser.toObject).toHaveBeenCalled();
      expect(userRet.access_token).toBeDefined();
      expect(userRet.refresh_token).toBeDefined();
    });
  });

  describe('generateAccessToken', () => {
    it('should return access_token', () => {
      const spy = jest.spyOn(configService, 'get').mockReturnValue('5h');
      const access_token = authService.generateAccessToken(mockUser._id);
      expect(spy).toHaveBeenCalledWith('ACCESS_TOKEN_DURATION');
      expect(access_token).toBeDefined();
      expect(jwtService.decode(access_token)).toHaveProperty(
        'user_id',
        mockUser._id,
      );
    });

    it('should return refresh_token', () => {
      const spy = jest.spyOn(configService, 'get').mockReturnValue('5h');
      const refresh_token = authService.generateAccessToken(mockUser._id, true);
      expect(spy).toHaveBeenCalledWith('REFRESH_TOKEN_DURATION');
      expect(refresh_token).toBeDefined();
      expect(jwtService.decode(refresh_token)).toHaveProperty(
        'user_id',
        mockUser._id,
      );
    });
  });
});
