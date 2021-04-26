import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Platform } from '../game/interface/game.interface';
import { RepoGameResponse } from './interface/repo.interface';
import { RepoService } from './repo.service';
import { IGDBService } from './repoProviders/igdb.service';
import { RawgService } from './repoProviders/rawg.service';

const asyncTimeout = (ret, timeout) =>
  new Promise((res) => {
    setTimeout(() => res(ret), timeout);
  });

describe('RepoService', () => {
  let service: RepoService;
  let rawgService: RawgService;
  let igdbService: IGDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepoService,
        RawgService,
        {
          provide: IGDBService,
          useValue: {
            constructor: jest.fn(),
            new: jest.fn(),
            search: jest.fn(),
            init: jest.fn(),
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
        }),
      ],
    }).compile();

    service = module.get<RepoService>(RepoService);
    rawgService = module.get<RawgService>(RawgService);
    igdbService = module.get<IGDBService>(IGDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if search is called without initialization', async () => {
    await expect(
      service.search('sumname', [Platform.PS4], jest.fn()),
    ).rejects.toBeDefined();
  });

  describe('search()', () => {
    beforeEach(async () => {
      await service.init();
    });

    const returnValue1: RepoGameResponse[] = [
      {
        artwork: 'artwork1',
        name: 'name1',
        platforms: [Platform.PS4, Platform.PS5],
        release: new Date(),
        slug: 'slug1',
      },
    ];

    const returnValue2: RepoGameResponse[] = [
      {
        artwork: 'artwork2',
        name: 'name2',
        platforms: [Platform.PS4, Platform.XBOX_X],
        release: new Date(),
        slug: 'slug2',
      },
    ];

    it('calls onFirstReturnFn with promise that resolves first', async () => {
      jest
        .spyOn(rawgService, 'search')
        .mockResolvedValue(asyncTimeout(returnValue1, 500) as any);
      jest
        .spyOn(igdbService, 'search')
        .mockResolvedValue(asyncTimeout(returnValue2, 1000) as any);
      await service.search('sumname', [Platform.PS4], (res) => {
        const exp: any = { ...returnValue1[0] };
        delete exp.platforms;
        exp.platform = Platform.PS4;
        expect(res).toEqual([exp]);
      });
    });

    it('skips first resolve if no results', async () => {
      jest
        .spyOn(rawgService, 'search')
        .mockResolvedValue(asyncTimeout([], 500) as any);
      jest
        .spyOn(igdbService, 'search')
        .mockResolvedValue(asyncTimeout(returnValue2, 1000) as any);
      await service.search('sumname', [Platform.PS4], (res) => {
        const exp: any = { ...returnValue2[0] };
        delete exp.platforms;
        exp.platform = Platform.PS4;
        expect(res).toEqual([exp]);
      });
    });

    it('should merge games with same slugs', async () => {
      const game1 = [{ ...returnValue1[0] }];
      const game2 = [{ ...returnValue2[0], slug: 'slug1' }];
      jest
        .spyOn(rawgService, 'search')
        .mockResolvedValue(asyncTimeout(game1, 500) as any);
      jest
        .spyOn(igdbService, 'search')
        .mockResolvedValue(asyncTimeout(game2, 1000) as any);
      const games = await service.search('sumname', [Platform.PS4], (res) => {
        const exp: any = { ...returnValue1[0] };
        delete exp.platforms;
        exp.platform = Platform.PS4;
        expect(res).toEqual([exp]);
      });
      expect(games.length).toBe(2);
      expect(games[0].slug).toEqual('slug1');
      expect(games[1].slug).toEqual('slug1');
      expect(games[0].description).toEqual(game2[0].description);
      expect(games[1].description).toEqual(game2[0].description);
    });
  });

  describe('mapRepoGameToGameSchema()', () => {
    const returnValue: RepoGameResponse[] = [
      {
        artwork: 'artwork',
        name: 'name',
        platforms: [Platform.PS4, Platform.PS5],
        release: new Date(),
        slug: 'slug',
      },
    ];
    it('should return game document duplicated for every platform', () => {
      const games = RepoService.mapRepoGameToGameSchema(returnValue);
      expect(games.length).toEqual(returnValue[0].platforms.length);
      returnValue[0].platforms.forEach((platform, i) => {
        expect(games[i].name).toEqual(returnValue[0].name);
        expect(games[i].artwork).toEqual(returnValue[0].artwork);
        expect(games[i].release).toEqual(returnValue[0].release);
        expect(games[i].slug).toEqual(returnValue[0].slug);
        expect(games[i].platform).toEqual(platform);
      });
    });
  });
});
