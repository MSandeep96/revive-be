import * as faker from 'faker';
import { Platform } from '../../src/game/interface/game.interface';
import {
  UpsertListingDto,
  DeleteListingDto,
  FetchGameListingQueryDto,
  UpdateListingDto,
} from '../../src/listing/dto/listing.dto';
import {
  ListingType,
  RentingPeriod,
} from '../../src/listing/interface/listing.interface';

export class ListingFixture {
  static getFakeListingDto = (): UpsertListingDto => {
    const fakeData = {} as UpsertListingDto;
    const listingType = faker.random.arrayElements([0, 1, 2]);
    if (listingType.includes(ListingType.SALE)) {
      fakeData.saleDetails = {
        price: faker.datatype.float(),
      };
    }
    if (listingType.includes(ListingType.RENT)) {
      fakeData.rentDetails = {
        price: faker.datatype.float(),
        period: faker.random.arrayElement(Object.values(RentingPeriod)),
      };
    }
    return {
      ...fakeData,
      listingType,
      slug: faker.lorem.slug(),
      platform: faker.random.arrayElement(Object.values(Platform)),
    };
  };

  static getFakeQueryDto = (): FetchGameListingQueryDto => ({
    lat: Number(faker.address.latitude()),
    long: Number(faker.address.longitude()),
    platform: faker.random.arrayElement(Object.values(Platform)),
    slug: faker.lorem.slug(),
  });

  static getFakeUpdateDto = (): UpdateListingDto => {
    const fakeDto = ListingFixture.getFakeListingDto();
    return {
      platform: faker.random.arrayElement(Object.values(Platform)),
      slug: faker.lorem.slug(),
      listingType: fakeDto.listingType,
      rentDetails: fakeDto.rentDetails,
      saleDetails: fakeDto.saleDetails,
    };
  };

  static getFakeDeleteDto = (): DeleteListingDto => {
    return {
      slug: faker.lorem.slug(),
      platform: faker.random.arrayElement(Object.values(Platform)),
    };
  };
}
