import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { UserDocument } from '../../user/schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';

describe('jwt strategy', () => {
  let jwtStrategy: JwtStrategy;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({})],
      providers: [
        JwtStrategy,
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();
    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    model = moduleRef.get<Model<UserDocument>>(getModelToken('User'));
  });

  it('should return user', async () => {
    const payload = { user_id: 'sum_id' };
    const user: UserDocument = { username: 'sumthang' } as UserDocument;
    const spy = jest.spyOn(model, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    } as any);
    const userRet = await jwtStrategy.validate(payload);
    expect(spy).toHaveBeenCalledWith(payload.user_id);
    expect(user).toEqual(userRet);
  });
});
