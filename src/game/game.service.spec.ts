import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import { RepoService } from '../repo/repo.service';
import { GameService } from './game.service';
import { Platform } from './interface/game.interface';
import { Game, GameDocument } from './schemas/game.schema';

describe('GameService', () => {
  let service: GameService;
  let repoService: RepoService;
  let gameModel: Model<GameDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      imports: [LoggerModule.forRoot()],
    }).compile();

    service = module.get<GameService>(GameService);
    repoService = module.get<RepoService>(RepoService);
    gameModel = module.get<Model<GameDocument>>(getModelToken('Game'));
  });

  it('should be defined', () => {
    expect(repoService.init).toHaveBeenCalled();
    expect(service).toBeDefined();
  });

  describe('searchDatabase()', async () => {
    it('should query database', async () => {
      const spy = jest.spyOn(gameModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
      const data = await service.searchDatabase('sumname', [Platform.PS4]);
      expect(spy).toHaveBeenCalled();
      expect(data).toEqual([]);
    });
  });

  const returnValue: Game[] = [
    {
      artwork: 'artwork',
      name: 'name',
      platform: Platform.PS4,
      release: new Date(),
      slug: 'slug',
    },
    {
      artwork: 'artwork',
      name: 'name',
      platform: Platform.PS5,
      release: new Date(),
      slug: 'slug',
    },
  ];

  describe('searchRepos()', async () => {
    it('should call updateOne with games', async () => {
      const spy = jest
        .spyOn(repoService, 'search')
        .mockResolvedValueOnce(returnValue);
      const spyModel = jest
        .spyOn(gameModel, 'updateOne')
        .mockImplementation(() => {
          return { exec: jest.fn() } as any;
        });
      const mockFn = jest.fn();
      await service.searchRepos('name', [Platform.PS4, Platform.PS5], mockFn);
      expect(spy).toHaveBeenCalledWith(
        'name',
        [Platform.PS4, Platform.PS5],
        mockFn,
      );
      expect(spyModel).toHaveBeenCalledTimes(2);
    });
  });
});
