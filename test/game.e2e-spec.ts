import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { Model } from 'mongoose';
import { Logger } from 'nestjs-pino';
import slugify from 'slugify';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GameService } from '../src/game/game.service';
import { Platform } from '../src/game/interface/game.interface';
import { Game, GameDocument } from '../src/game/schemas/game.schema';

const asyncTimeout = (ret, timeout) =>
  new Promise((res) => {
    setTimeout(() => res(ret), timeout);
  });

describe('GameController (e2e)', () => {
  let app: INestApplication;
  let gameModel: Model<GameDocument>;
  let gameService: GameService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
    gameModel = moduleFixture.get<Model<GameDocument>>(getModelToken('Game'));
    gameService = moduleFixture.get<GameService>(GameService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/search (GET)', () => {
    describe('validations', () => {
      it('should reject if name is less than 3 chars', async () => {
        const resp = await request(app.getHttpServer())
          .get('/game/search')
          .query({ name: 'un', platforms: 'ps4,ps5' });
        expect(resp.status).toBe(400);
      });

      it('should reject if platforms are invalid', async () => {
        expect.assertions(4);
        const invalidPlatforms = ['ps4,ps6', '', undefined, 'xbox420'];
        const resps = await Promise.all(
          invalidPlatforms.map((platforms) =>
            request(app.getHttpServer())
              .get('/game/search')
              .query({ name: 'uncharted', platforms }),
          ),
        );
        resps.forEach((resp) => expect(resp.status).toBe(400));
      });
    });

    describe('should search repo if nothing in the database', () => {
      beforeEach(async () => {
        await gameModel.deleteMany({}).exec();
      });

      afterEach(async () => {
        jest.clearAllMocks();
      });
      it('should query repos if not found in database and add it to database', async () => {
        let rocketLeagueGame = await gameModel.find({}).exec();
        expect(rocketLeagueGame.length).toBe(0);
        const resp = await request(app.getHttpServer())
          .get('/game/search')
          .query({ name: 'rocket league', platforms: 'ps4,xbox_1' });
        expect(resp.status).toBe(200);
        expect(Array.isArray(resp.body)).toBe(true);
        resp.body.forEach((elem) => {
          expect(elem.platform).toBeDefined();
          expect(Array.isArray(elem.platform)).toBe(false);
        });
        //there have to be two awaits to break the application flow and let it
        // get all responses(one await) and save them to db(another await)
        await asyncTimeout('stub', 500); //big brain awaits
        await asyncTimeout('stub2', 500);
        rocketLeagueGame = await gameModel.find({}).exec();
        expect(rocketLeagueGame.length).not.toBe(0);
      });

      it('should return from database if more than 4 games were found', async () => {
        const mockData = [
          ['rocket league', Platform.PS4],
          ['rocket league', Platform.PS5],
          ['rocket league big', Platform.PS4],
          ['rocket league big', Platform.PS5],
          ['rocket league small', Platform.PS5],
        ];
        const games: Game[] = mockData.map((data) =>
          getFakeGame(data[0], data[1]),
        );
        const gamesDb = (await gameModel.insertMany(games)).map((obj) =>
          JSON.parse(JSON.stringify(obj.toJSON())),
        );
        const spy = jest.spyOn(gameService, 'searchRepos');
        const resp = await request(app.getHttpServer())
          .get('/game/search')
          .query({ name: 'rocket league', platforms: 'ps4,ps5' });
        expect(spy).not.toHaveBeenCalled();
        expect(resp.status).toBe(200);
        expect(resp.body).toEqual(expect.arrayContaining(gamesDb));
      });
    });
  });
});

// Fixtures

const getFakeGame = (name, platform): Game => {
  return {
    name,
    platform,
    artwork: faker.image.imageUrl(),
    release: faker.date.past(),
    slug: slugify(name, { lower: true, strict: true }),
  };
};
