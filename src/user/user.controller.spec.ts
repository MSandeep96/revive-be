import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { IRequestGetProfile } from './interfaces/controller.interface';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UsersController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should get user object', () => {
      const user = { username: 'sumusername' };
      const req = {
        user: {
          getObject: jest.fn().mockReturnValue(user),
        },
      };
      const userRet = controller.getProfile(
        (req as unknown) as IRequestGetProfile,
      );
      expect(req.user.getObject).toBeCalled();
      expect(userRet).toEqual(user);
    });
  });
});