import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { LoggerModule } from 'nestjs-pino';
import { RepoService } from '../repo/repo.service';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Platform } from './interface/game.interface';
import { GameDocument } from './schemas/game.schema';

describe('GameController', () => {
  let controller: GameController;
  let gameService: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        {
          provide: RepoService,
          useValue: {
            init: jest.fn(),
            search: jest.fn(),
          },
        },
        {
          provide: getModelToken('Game'),
          useValue: {
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
      imports: [LoggerModule.forRoot({})],
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search()', () => {
    it('should return database results if more than 4 games', async () => {
      const mockGames = ([{}, {}, {}, {}, {}] as unknown) as GameDocument[];
      const spy = jest
        .spyOn(gameService, 'searchDatabase')
        .mockResolvedValueOnce(mockGames);
      const sendObj = {
        send: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnValue(sendObj),
      };
      await controller.search(
        { name: 'name', platforms: [Platform.PS4] },
        (res as unknown) as Response,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(sendObj.send).toHaveBeenCalledWith(mockGames);
    });

    it('should search repos if database has less than 3 games', async () => {
      const mockGames = ([{}, {}, {}] as unknown) as GameDocument[];
      const spy = jest
        .spyOn(gameService, 'searchDatabase')
        .mockResolvedValueOnce(mockGames);
      const spySearchRepos = jest
        .spyOn(gameService, 'searchRepos')
        .mockImplementation((name, platforms, fn) => {
          return Promise.resolve(fn(mockGames, 'sumRepoProvider'));
        });
      const sendObj = {
        send: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnValue(sendObj),
      };
      await controller.search(
        { name: 'name', platforms: [Platform.PS4] },
        (res as unknown) as Response,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(sendObj.send).toHaveBeenCalledWith(mockGames);
    });
  });
});
