import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserDocument } from '../src/user/schemas/user.schema';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken('User'));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user (GET)', () => {
    let user: UserDocument;
    beforeEach(async () => {
      userModel.deleteMany({});
      user = await userModel.create({ email: 'randomEmail@mail.com' });
    });

    it('should return 401 if Authorization header not set', () => {
      return request(app.getHttpServer()).get('/user').expect(401);
    });

    it('should return user with valid auth header', () => {
      const authToken = jwtService.sign({ user_id: user.id });
      const resp = JSON.parse(JSON.stringify(user.toObject()));
      return request(app.getHttpServer())
        .get('/user')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect(resp);
    });
  });
});
