import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserLoginDto } from './user.dto';
import { UserService } from './user.service';

const user: User = {
  email: 'sum@sum.com',
  phone: '849384398',
  username: 'guestoflskdf',
};

describe('UsersService', () => {
  let service: UserService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            new: jest.fn().mockResolvedValue(user),
            constructor: jest.fn().mockResolvedValue(user),
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should findById', async () => {
    const spy = jest.spyOn(model, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(user),
    } as any);
    const id = 'sumid';
    const userRet = await service.findById(id);
    expect(spy).toBeCalledWith(id);
    expect(userRet).toBe(user);
  });

  it('should getUserByPhone', async () => {
    const spy = jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(user),
    } as any);
    const phone = '8754375843';
    const userRet = await service.getUserByPhone(phone);
    expect(spy).toBeCalledWith({ phone });
    expect(userRet).toBe(user);
  });

  it('should getUserByEmail', async () => {
    const spy = jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(user),
    } as any);
    const email = 'sum@sum.com';
    const userRet = await service.getUserByEmail(email);
    expect(spy).toBeCalledWith({ email });
    expect(userRet).toBe(user);
  });

  it('should createUser', async () => {
    const spy = jest
      .spyOn(model, 'create')
      .mockImplementationOnce(() => Promise.resolve(user));
    const userDto: UserLoginDto = { email: 'sumthanwong@mail.com' };
    const userRet = await service.createUser(userDto);
    expect(spy).toBeCalledWith(userDto);
    expect(userRet).toBe(user);
  });
});
