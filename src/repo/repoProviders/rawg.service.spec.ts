import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { LoggerModule } from 'nestjs-pino';
import { Platform } from '../../game/interface/game.interface';
import { RawgService } from './rawg.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IGDB service', () => {
  let rawgService: RawgService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot(),
      ],
      providers: [RawgService],
    }).compile();
    rawgService = module.get<RawgService>(RawgService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(rawgService).toBeDefined();
  });

  describe('mapToSchema()', () => {
    it('should map response to RepoGameResponse', () => {
      const data = rawgService.mapToSchema(mockResponse.results[0]);
      expect(data.artwork).toEqual(mockResponse.results[0].background_image);
      expect(data.description).toEqual(undefined);
      expect(data.name).toEqual(mockResponse.results[0].name);
      expect(data.platforms).toEqual(
        expect.arrayContaining(Object.values(Platform)),
      );
      expect(data.rating).toEqual(mockResponse.results[0].rating * 20);
      expect(data.slug).toEqual('cyberpunk-2077');
    });
  });

  describe('getQueryParams()', () => {
    it('should return object with name and platforms mapped ', () => {
      const name = 'hell';
      const plats = [Platform.PS4, Platform.PS5];
      const platsMapped = '18,187';
      const params = rawgService.getQueryParams(name, plats);
      expect(params).toHaveProperty('search', name);
      expect(params).toHaveProperty('platforms', platsMapped);
    });
  });

  describe('search()', () => {
    it('should fetch games', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockResponse });
      const data = await rawgService.search('sumname', [Platform.PS4]);
      expect(data).toEqual(expectedMockSearch);
    });
  });
});

// Fixtures

const mockResponse = {
  count: 83,
  next:
    'https://api.rawg.io/api/games?key=40b3f0ef58294fc0ae324c257a8aba5f&page=2&platforms=18%2C1%2C187%2C186&search=cyberpunk+2077',
  previous: null,
  results: [
    {
      slug: 'cyberpunk-2077',
      name: 'Cyberpunk 2077',
      playtime: 19,
      platforms: [
        {
          platform: {
            id: 4,
            name: 'PC',
            slug: 'pc',
          },
        },
        {
          platform: {
            id: 187,
            name: 'PlayStation 5',
            slug: 'playstation5',
          },
        },
        {
          platform: {
            id: 1,
            name: 'Xbox One',
            slug: 'xbox-one',
          },
        },
        {
          platform: {
            id: 18,
            name: 'PlayStation 4',
            slug: 'playstation4',
          },
        },
        {
          platform: {
            id: 186,
            name: 'Xbox Series S/X',
            slug: 'xbox-series-x',
          },
        },
      ],
      stores: [
        {
          store: {
            id: 1,
            name: 'Steam',
            slug: 'steam',
          },
        },
        {
          store: {
            id: 3,
            name: 'PlayStation Store',
            slug: 'playstation-store',
          },
        },
        {
          store: {
            id: 2,
            name: 'Xbox Store',
            slug: 'xbox-store',
          },
        },
        {
          store: {
            id: 5,
            name: 'GOG',
            slug: 'gog',
          },
        },
        {
          store: {
            id: 11,
            name: 'Epic Games',
            slug: 'epic-games',
          },
        },
      ],
      released: '2020-12-10',
      tba: false,
      background_image:
        'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
      rating: 4.12,
      rating_top: 5,
      ratings: [
        {
          id: 5,
          title: 'exceptional',
          count: 459,
          percent: 50.89,
        },
        {
          id: 4,
          title: 'recommended',
          count: 244,
          percent: 27.05,
        },
        {
          id: 3,
          title: 'meh',
          count: 121,
          percent: 13.41,
        },
        {
          id: 1,
          title: 'skip',
          count: 78,
          percent: 8.65,
        },
      ],
      ratings_count: 860,
      reviews_text_count: 30,
      added: 6780,
      added_by_status: {
        yet: 474,
        owned: 3287,
        beaten: 445,
        toplay: 2237,
        dropped: 109,
        playing: 228,
      },
      metacritic: 68,
      suggestions_count: 622,
      updated: '2021-02-24T09:22:52',
      id: 41494,
      score: '73.48014',
      clip: null,
      tags: [
        {
          id: 31,
          name: 'Singleplayer',
          slug: 'singleplayer',
          language: 'eng',
          games_count: 109447,
          image_background:
            'https://media.rawg.io/media/games/c4b/c4b0cab189e73432de3a250d8cf1c84e.jpg',
        },
      ],
      esrb_rating: {
        id: 5,
        name: 'Adults Only',
        slug: 'adults-only',
        name_en: 'Adults Only',
        name_ru: 'Только для взрослых',
      },
      user_game: null,
      reviews_count: 902,
      saturated_color: '0f0f0f',
      dominant_color: '0f0f0f',
      short_screenshots: [
        {
          id: -1,
          image:
            'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
        },
      ],
      parent_platforms: [
        {
          platform: {
            id: 1,
            name: 'PC',
            slug: 'pc',
          },
        },
        {
          platform: {
            id: 2,
            name: 'PlayStation',
            slug: 'playstation',
          },
        },
        {
          platform: {
            id: 3,
            name: 'Xbox',
            slug: 'xbox',
          },
        },
      ],
      genres: [
        {
          id: 3,
          name: 'Adventure',
          slug: 'adventure',
        },
        {
          id: 4,
          name: 'Action',
          slug: 'action',
        },
        {
          id: 5,
          name: 'RPG',
          slug: 'role-playing-games-rpg',
        },
      ],
    },
  ],
  user_platforms: false,
};

const expectedMockSearch = [
  {
    artwork:
      'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
    name: 'Cyberpunk 2077',
    platforms: ['ps5', 'xbox_1', 'ps4', 'xbox_x'],
    rating: 82.4,
    release: new Date('2020-12-10 00:00'),
    slug: 'cyberpunk-2077',
  },
];
