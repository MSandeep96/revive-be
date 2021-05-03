import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { Model } from 'mongoose';
import { ListingFixture } from '../../test/fixtures/listing.fixture';
import { UserDocument } from '../user/schemas/user.schema';
import { DeleteListingDto, UpdateListingDto } from './dto/listing.dto';
import { ListingType } from './interface/listing.interface';
import { ListingService } from './listing.service';
import { Listing, ListingDocument } from './schemas/listing.schema';

describe('ListingService', () => {
  let service: ListingService;
  let listingModel: Model<ListingDocument>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        {
          provide: getModelToken(Listing.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
            findOne: jest.fn(),
            deleteOne: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
    listingModel = module.get<Model<ListingDocument>>(
      getModelToken(Listing.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createListing()', () => {
    it('should create listing', async () => {
      const user = ({
        location: {
          type: 'Point',
          coordinates: [faker.address.longitude(), faker.address.latitude()],
        },
        _id: faker.datatype.uuid(),
      } as unknown) as UserDocument;
      const listing = ListingFixture.getFakeListingDto();
      await service.createListing(listing, user);
      expect(listingModel.create).toBeCalledWith({
        ...listing,
        location: user.location,
        createdBy: user._id,
      });
    });

    it('should throw error if invalid listing type', async () => {
      let fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.SALE)) {
        fakeListing.listingType.push(ListingType.SALE);
      }
      delete fakeListing.saleDetails;
      await expect(
        service.createListing(fakeListing, {} as UserDocument),
      ).rejects.toBeDefined();
      fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.RENT)) {
        fakeListing.listingType.push(ListingType.RENT);
      }
      delete fakeListing.rentDetails;
      await expect(
        service.createListing(fakeListing, {} as UserDocument),
      ).rejects.toBeDefined();
    });
  });

  describe('fetchListings()', () => {
    it('should fetch listings', async () => {
      const queryDto = ListingFixture.getFakeQueryDto();
      const queryObj = {
        slug: queryDto.slug,
        platform: queryDto.platform,
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [queryDto.long, queryDto.lat],
            },
            $maxDistance: 15000,
          },
        },
      };
      await service.fetchListings(queryDto);
      expect(listingModel.find).toBeCalledWith(queryObj);
      expect(listingModel.find().exec).toBeCalled();
    });
  });

  describe('updateListing()', () => {
    it('should throw error if invalid listing type', async () => {
      let fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.SALE)) {
        fakeListing.listingType.push(ListingType.SALE);
      }
      delete fakeListing.saleDetails;
      await expect(
        service.createListing(fakeListing, {} as UserDocument),
      ).rejects.toBeDefined();
      fakeListing = ListingFixture.getFakeListingDto();
      if (!fakeListing.listingType.includes(ListingType.RENT)) {
        fakeListing.listingType.push(ListingType.RENT);
      }
      delete fakeListing.rentDetails;
      await expect(
        service.createListing(fakeListing, {} as UserDocument),
      ).rejects.toBeDefined();
    });

    it('should update listing', async () => {
      const updateDto = ListingFixture.getFakeUpdateDto();
      const fakeListing: any = ListingFixture.getFakeListingDto();
      fakeListing.save = jest.fn();
      const spy = jest.spyOn(listingModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(fakeListing),
      } as any);
      const user = {
        _id: faker.datatype.uuid(),
      } as UserDocument;
      await service.updateListing(user, updateDto);
      expect(spy).toBeCalledWith({
        createdBy: user._id,
        platform: updateDto.platform,
        slug: updateDto.slug,
      });
      expect(fakeListing.listingType).toEqual(updateDto.listingType);
      expect(fakeListing.saleDetails).toEqual(updateDto.saleDetails);
      expect(fakeListing.rentDetails).toEqual(updateDto.rentDetails);
    });

    it('should throw exception if no listing is found', async () => {
      const updateDto = ListingFixture.getFakeUpdateDto();
      const fakeListing: any = ListingFixture.getFakeListingDto();
      fakeListing.save = jest.fn();
      const spy = jest.spyOn(listingModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      const user = {
        _id: faker.datatype.uuid(),
      } as UserDocument;
      const listingDto: UpdateListingDto = ListingFixture.getFakeUpdateDto();
      await expect(
        service.updateListing(user, listingDto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('deleteListing()', () => {
    it('should delete listing', () => {
      const listingDto: DeleteListingDto = ListingFixture.getFakeDeleteDto();
      const user = {
        _id: faker.datatype.uuid(),
      } as UserDocument;
      service.deleteListing(user, listingDto);
      expect(listingModel.deleteOne).toHaveBeenCalledWith({
        ...listingDto,
        createdBy: user._id,
      });
    });
  });
});
