import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GameDocument } from '../src/game/schemas/game.schema';

describe('GameController (e2e)', () => {
  let app: INestApplication;
  let gameModel: Model<GameDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    gameModel = moduleFixture.get<Model<GameDocument>>(getModelToken('Game'));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/search (GET)', () => {
    beforeEach(async () => {
      gameModel.deleteMany({});
    });

    it('should return from repo providers if not found in database', async () => {
      const resp = await request(app.getHttpServer())
        .get('/game/search')
        .query({ name: 'unchar', platform: ['ps4', 'ps5'] });
      expect(resp.status).toBe(400);
    });
  });
});

// Fixtures
