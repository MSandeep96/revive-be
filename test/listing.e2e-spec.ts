import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ListingDocument } from '../src/listing/schemas/listing.schema';
import { UserDocument } from '../src/user/schemas/user.schema';
import { ListingFixture } from './fixtures/listing.fixture';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let listingModel: Model<ListingDocument>;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    listingModel = moduleFixture.get<Model<ListingDocument>>(
      getModelToken('Listing'),
    );
    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken('User'));
    await listingModel.deleteMany({}).exec();
  });

  afterAll(async () => {
    // await listingModel.deleteMany({}).exec();
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should fail validation check', () => {
      const invalidValues = [];
      const fail = ListingFixture.getFakeQueryDto();
      invalidValues.push({ ...fail, platform: 'ps150' });
      const { slug, ...missingSlugValue } = fail;
      invalidValues.push(missingSlugValue);
      invalidValues.forEach(async (val) => {
        await request(app.getHttpServer())
          .get('/listing')
          .query(val)
          .expect(400);
      });
    });

    it.skip('should return listing within 15kms of query location', async () => {
      const fakeQuery = ListingFixture.getFakeQueryDto();
      const insertions = [];
      for (let i = 0; i < 3; i++) {
        const variance = () =>
          Math.random() * 0.1363 * (Math.random() < 0.5 ? -1 : 1);
        const newFakeObj = ListingFixture.getFakeListingDto() as any;
        newFakeObj.location = {
          type: 'Point',
          coordinates: [
            fakeQuery.long + variance(),
            fakeQuery.lat + variance(),
          ],
        };
        insertions.push(newFakeObj);
      }
      const farFakeInsertions = [];
      for (let i = 0; i < 3; i++) {
        let variance = Math.random() * 5 * (Math.random() < 0.5 ? -1 : 1);
        if (variance < 0.1363 && variance > -0.1363) variance = 0.8;
        const newFakeObj = ListingFixture.getFakeListingDto() as any;
        newFakeObj.location = {
          type: 'Point',
          coordinates: [fakeQuery.long + variance, fakeQuery.lat + variance],
        };
        farFakeInsertions.push(newFakeObj);
      }
      try {
        await listingModel.insertMany([...insertions, ...farFakeInsertions]);
      } catch (err) {
        console.log(err);
      }
      const listings = await request(app.getHttpServer())
        .get('/listing')
        .query(fakeQuery);
      expect(listings.status).toBe(200);
      expect(listings.body).toEqual(JSON.parse(JSON.stringify(insertions)));
    });
  });
});
