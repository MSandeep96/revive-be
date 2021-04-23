import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './jwt.strategy';

describe('jwt strategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      providers: [
        UserService,
        JwtStrategy,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
    }).compile();
    userService = moduleRef.get<UserService>(UserService);
    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  it('should return user', async () => {
    const payload = { user_id: 'sum_id' };
    const user: UserDocument = { username: 'sumthang' } as UserDocument;
    const spy = jest
      .spyOn(userService, 'getUserByJwt')
      .mockImplementation(() => {
        return Promise.resolve(user);
      });
    const userRet = await jwtStrategy.validate(payload);
    expect(spy).toHaveBeenCalledWith(payload);
    expect(user).toEqual(userRet);
  });
});
