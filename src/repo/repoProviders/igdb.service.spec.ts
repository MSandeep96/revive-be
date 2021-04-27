import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { LoggerModule } from 'nestjs-pino';
import { Platform } from '../../game/interface/game.interface';
import { IGDBService } from './igdb.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IGDB service', () => {
  let igdbService: IGDBService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot(),
      ],
      providers: [IGDBService],
    }).compile();
    igdbService = module.get<IGDBService>(IGDBService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(igdbService).toBeDefined();
  });

  it('should authenticate on initialization', async () => {
    const spy = jest.spyOn(igdbService, 'authenticate');
    await igdbService.init();
    expect(spy).toHaveBeenCalled();
  });

  describe('mapToSchema()', () => {
    it('should map response to RepoGameResponse', () => {
      const data = igdbService.mapToSchema(mockResponse[0]);
      expect(data.artwork).toEqual(
        'https://images.igdb.com/igdb/image/upload/t_720p/v76vzx1jwsi05aarxv5r.jpg',
      );
      expect(data.description).toEqual(mockResponse[0].summary);
      expect(data.name).toEqual(mockResponse[0].name);
      expect(data.platforms).toEqual(
        expect.arrayContaining(Object.values(Platform)),
      );
      expect(data.rating).toEqual(mockResponse[0].aggregated_rating);
      expect(data.release).toEqual(
        new Date(mockResponse[0].first_release_date * 1000),
      );
      expect(data.slug).toEqual('cyberpunk-2077');
    });

    it('should set game_img to undefined if no artworks', () => {
      const response = { ...mockResponse[0] };
      response.artworks = [];
      const data = igdbService.mapToSchema(response);
      expect(data.artwork).toBeUndefined();
    });
  });

  describe('getQueryBody()', () => {
    it('should return string with name and platforms mapped ', () => {
      const name = 'hell';
      const plats = [Platform.PS4, Platform.PS5];
      const platsMapped = '48,167';
      const body = igdbService.getQueryBody(name, plats);
      expect(body).toContain(name);
      expect(body).toContain(platsMapped);
    });
  });

  describe('search()', () => {
    it('should fetch games', async () => {
      const spyAuth = jest.spyOn(igdbService, 'authenticate');
      mockedAxios.post.mockResolvedValue({ data: mockResponse });
      const data = await igdbService.search('sumname', [Platform.PS4]);
      expect(spyAuth).not.toHaveBeenCalled();
      expect(data).toEqual(expectedMockSearch);
    });

    it('should reauthenticate if auth token has expired', async () => {
      let isFirstCall = true;
      const spyAuth = jest.spyOn(igdbService, 'authenticate');
      mockedAxios.post.mockImplementation((url) => {
        if (isFirstCall) {
          isFirstCall = false;
          return Promise.reject({ response: { status: 401 } });
        }
        return Promise.resolve({ data: mockResponse });
      });
      const data = await igdbService.search('sumname', [Platform.PS4]);
      expect(spyAuth).toHaveBeenCalled();
      expect(data).toEqual(expectedMockSearch);
    });

    it('should throw error if not 401', async () => {
      mockedAxios.post.mockImplementation((url) => {
        return Promise.reject({ response: { status: 400 } });
      });
      await expect(
        igdbService.search('sumname', [Platform.PS4]),
      ).rejects.toEqual({ response: { status: 400 } });
    });
  });
});

// Fixtures

const mockResponse = [
  {
    id: 1877,
    aggregated_rating: 73.0,
    artworks: [
      {
        id: 4940,
        url:
          '//images.igdb.com/igdb/image/upload/t_thumb/v76vzx1jwsi05aarxv5r.jpg',
      },
      {
        id: 4941,
        url:
          '//images.igdb.com/igdb/image/upload/t_thumb/laqjo2f5uv8ie9fdgtsc.jpg',
      },
    ],
    first_release_date: 1607558400,
    name: 'Cyberpunk 2077',
    platforms: [6, 48, 49, 167, 169, 170],
    summary:
      'Cyberpunk 2077 is a role-playing video game developed and published by CD Projekt. Adapted from the Cyberpunk franchise, the game is an open world, non-linear RPG with an FPS style in which players are able to heavily customize their character to suit their play style. Gun play, exploration, player choice and activities such as hacking are to feature heavily throughout the game with missions, quests and objectives being completed in a variety of different ways. The world will have dynamic weather and a day/night cycle to make it truly immersive.',
  },
];

const expectedMockSearch = [
  {
    artwork:
      'https://images.igdb.com/igdb/image/upload/t_720p/v76vzx1jwsi05aarxv5r.jpg',
    description:
      'Cyberpunk 2077 is a role-playing video game developed and published by CD Projekt. Adapted from the Cyberpunk franchise, the game is an open world, non-linear RPG with an FPS style in which players are able to heavily customize their character to suit their play style. Gun play, exploration, player choice and activities such as hacking are to feature heavily throughout the game with missions, quests and objectives being completed in a variety of different ways. The world will have dynamic weather and a day/night cycle to make it truly immersive.',
    name: 'Cyberpunk 2077',
    platforms: ['ps4', 'xbox_1', 'ps5', 'xbox_x'],
    rating: 73,
    release: new Date(1607558400000),
    slug: 'cyberpunk-2077',
  },
];
