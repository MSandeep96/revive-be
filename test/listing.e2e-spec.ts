import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Platform } from '../src/game/interface/game.interface';
import { ListingType } from '../src/listing/interface/listing.interface';
import { ListingDocument } from '../src/listing/schemas/listing.schema';
import { UserDocument } from '../src/user/schemas/user.schema';
import { ListingFixture } from './fixtures/listing.fixture';
import { UserFixture } from './fixtures/user.fixture';

describe('ListingController (e2e)', () => {
  let app: INestApplication;
  let listingModel: Model<ListingDocument>;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await listingModel.deleteMany({}).exec();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    afterAll(async () => {
      await listingModel.deleteMany({}).exec();
    });

    it('should fail validation check', async () => {
      expect.assertions(2);
      const invalidValues = [];
      const fail = ListingFixture.getFakeQueryDto();
      invalidValues.push({ ...fail, platform: 'ps150' });
      const { slug, ...missingSlugValue } = fail;
      invalidValues.push(missingSlugValue);
      for (const val of invalidValues) {
        const resp = await request(app.getHttpServer())
          .get('/listing')
          .query(val);
        expect(resp.status).toEqual(400);
      }
    });

    const getFakeListing = (fakeQuery) => {
      const newFakeObj = ListingFixture.getFakeListingDto() as any;
      newFakeObj.slug = fakeQuery.slug;
      newFakeObj.platform = fakeQuery.platform;
      newFakeObj.location = {
        type: 'Point',
        coordinates: [fakeQuery.long, fakeQuery.lat],
      };
      return newFakeObj;
    };

    it('should return listing within 15kms of query location', async () => {
      expect.assertions(2);
      const fakeQuery = ListingFixture.getFakeQueryDto();
      const insertions = [];
      for (let i = 0; i < 3; i++) {
        const variance = () =>
          Math.random() * 0.1363 * (Math.random() < 0.5 ? -1 : 1);
        const newFakeObj = getFakeListing(fakeQuery);
        newFakeObj.location.coordinates.map((e) => e + variance());
        insertions.push(newFakeObj);
      }
      const farFakeInsertions = [];
      for (let i = 0; i < 3; i++) {
        let variance = Math.random() * 5 * (Math.random() < 0.5 ? -1 : 1);
        if (variance < 0.1363 && variance > -0.1363) variance = 0.8;
        const newFakeObj = getFakeListing(fakeQuery);
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

  describe('/ (PUT)', () => {
    let userDoc: UserDocument;
    let authToken;
    beforeAll(async () => {
      userDoc = await UserFixture.getUserWithLocation(userModel);
      authToken = jwtService.sign({ user_id: userDoc._id });
    });

    afterAll(async () => {
      await listingModel.deleteMany({}).exec();
      await userModel.findByIdAndDelete(userDoc._id).exec();
    });

    it('should fail validation check', async () => {
      const invalidValues = [];
      let fakeListing = ListingFixture.getFakeListingDto();
      delete fakeListing.slug;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeListingDto();
      fakeListing.platform = 'ps160' as Platform;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeListingDto();
      fakeListing.listingType = [4, 5, 67];
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.SALE)) {
        fakeListing.listingType.push(ListingType.SALE);
      }
      delete fakeListing.saleDetails;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.RENT)) {
        fakeListing.listingType.push(ListingType.RENT);
      }
      delete fakeListing.rentDetails;
      for (const val of invalidValues) {
        const resp = await request(app.getHttpServer())
          .put('/listing')
          .auth(authToken, { type: 'bearer' })
          .send(val);
        expect(resp.status).toEqual(400);
      }
    });

    it('should create listing', async () => {
      const fakeListing = ListingFixture.getFakeListingDto();
      const resp = await request(app.getHttpServer())
        .put('/listing')
        .auth(authToken, { type: 'bearer' })
        .send(fakeListing);
      const expBody = {
        ...fakeListing,
        createdBy: userDoc._id,
        location: userDoc.location,
      };
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(JSON.parse(JSON.stringify(expBody)));
    });
  });

  describe('/ (POST)', () => {
    let userDoc: UserDocument;
    let authToken;
    beforeAll(async () => {
      userDoc = await UserFixture.getUserWithLocation(userModel);
      authToken = jwtService.sign({ user_id: userDoc._id });
    });

    afterAll(async () => {
      await listingModel.deleteMany({}).exec();
      await userModel.findByIdAndDelete(userDoc._id).exec();
    });

    it('should fail validation check', async () => {
      const invalidValues = [];
      let fakeListing = ListingFixture.getFakeUpdateDto();
      delete fakeListing.slug;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeUpdateDto();
      fakeListing.platform = 'ps160' as Platform;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeUpdateDto();
      fakeListing.listingType = [4, 5, 67];
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeUpdateDto();
      if (!fakeListing.listingType.includes(ListingType.SALE)) {
        fakeListing.listingType.push(ListingType.SALE);
      }
      delete fakeListing.saleDetails;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeUpdateDto();
      if (!fakeListing.listingType.includes(ListingType.RENT)) {
        fakeListing.listingType.push(ListingType.RENT);
      }
      delete fakeListing.rentDetails;
      for (const val of invalidValues) {
        const resp = await request(app.getHttpServer())
          .put('/listing')
          .auth(authToken, { type: 'bearer' })
          .send(val);
        expect(resp.status).toEqual(400);
      }
    });

    it('should update listing', async () => {
      const fakeListingObj: any = ListingFixture.getFakeListingDto();
      fakeListingObj.createdBy = userDoc._id;
      fakeListingObj.location = userDoc.location;
      await listingModel.create(fakeListingObj);
      const fakeUpdateObj = ListingFixture.getFakeUpdateDto();
      fakeUpdateObj.slug = fakeListingObj.slug;
      fakeUpdateObj.platform = fakeListingObj.platform;
      const resp = await request(app.getHttpServer())
        .post('/listing')
        .auth(authToken, { type: 'bearer' })
        .send(fakeUpdateObj);
      expect(resp.status).toBe(201);
      const obj = await listingModel
        .findOne({
          createdBy: userDoc._id,
          slug: fakeListingObj.slug,
          platform: fakeListingObj.platform,
        })
        .exec();
      expect(obj.toJSON()).toEqual({ ...fakeListingObj, ...fakeUpdateObj });
    });
  });

  describe('/ (DELETE)', () => {
    let userDoc: UserDocument;
    let authToken;
    beforeAll(async () => {
      userDoc = await UserFixture.getUserWithLocation(userModel);
      authToken = jwtService.sign({ user_id: userDoc._id });
    });

    afterAll(async () => {
      await listingModel.deleteMany({}).exec();
      await userModel.findByIdAndDelete(userDoc._id).exec();
    });

    it('should fail validation check', async () => {
      const invalidValues = [];
      let fakeListing = ListingFixture.getFakeDeleteDto();
      delete fakeListing.slug;
      invalidValues.push(fakeListing);
      fakeListing = ListingFixture.getFakeDeleteDto();
      fakeListing.platform = 'ps160' as Platform;
      invalidValues.push(fakeListing);
      for (const val of invalidValues) {
        const resp = await request(app.getHttpServer())
          .put('/listing')
          .auth(authToken, { type: 'bearer' })
          .send(val);
        expect(resp.status).toEqual(400);
      }
    });

    it('should delete listing', async () => {
      const fakeListingObj: any = ListingFixture.getFakeListingDto();
      fakeListingObj.createdBy = userDoc._id;
      fakeListingObj.location = userDoc.location;
      await listingModel.create(fakeListingObj);
      const resp = await request(app.getHttpServer())
        .delete('/listing')
        .auth(authToken, { type: 'bearer' })
        .query({
          slug: fakeListingObj.slug,
          platform: fakeListingObj.platform,
        });
      expect(resp.status).toBe(200);
      const obj = await listingModel
        .findOne({
          createdBy: userDoc._id,
          slug: fakeListingObj.slug,
          platform: fakeListingObj.platform,
        })
        .exec();
      expect(obj).toBeNull();
    });
  });
});
