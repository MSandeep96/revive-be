import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { Model } from 'mongoose';
import { ListingFixture } from '../../test/fixtures/listing.fixture';
import { UserDocument } from '../user/schemas/user.schema';
import { DeleteListingDto, UpdateListingDto } from './dto/listing.dto';
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
          coordinates: [faker.address.longitude, faker.address.latitude],
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
    it('should update listing', async () => {
      const updateDto = ListingFixture.getFakeUpdateDto();
      const fakeListing: any = ListingFixture.getFakeListingDto();
      fakeListing.save = jest.fn();
      const spy = jest.spyOn(listingModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(fakeListing),
      } as any);
      const listingDto: UpdateListingDto = {
        id: faker.datatype.uuid(),
        ...updateDto,
      };
      await service.updateListing(listingDto);
      expect(spy).toBeCalledWith({ _id: listingDto.id });
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
      const listingDto: UpdateListingDto = {
        id: faker.datatype.uuid(),
        ...updateDto,
      };
      await expect(service.updateListing(listingDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(spy).toBeCalledWith({ _id: listingDto.id });
    });
  });

  describe('deleteListing()', () => {
    it('should delete listing', () => {
      const listingDto: DeleteListingDto = {
        id: faker.datatype.uuid(),
      };
      service.deleteListing(listingDto);
      expect(listingModel.deleteOne).toHaveBeenCalledWith({
        _id: listingDto.id,
      });
    });
  });
});
