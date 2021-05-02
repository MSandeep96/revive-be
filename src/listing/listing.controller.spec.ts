import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { ListingFixture } from '../../test/fixtures/listing.fixture';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
describe('ListingController', () => {
  let controller: ListingController;
  let listingService: ListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [
        {
          provide: ListingService,
          useValue: {
            createListing: jest.fn(),
            fetchListings: jest.fn(),
            updateListing: jest.fn(),
            deleteListing: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ListingController>(ListingController);
    listingService = module.get<ListingService>(ListingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createListing on ListingService', async () => {
    const listing = ListingFixture.getFakeListingDto();
    const req = {
      user: {},
    };
    await controller.create(req, listing);
    expect(listingService.createListing).toHaveBeenCalledWith(
      listing,
      req.user,
    );
  });

  it('should call fetchListings on ListingService', async () => {
    const query = ListingFixture.getFakeQueryDto();
    await controller.fetchListings(query);
    expect(listingService.fetchListings).toHaveBeenCalledWith(query);
  });

  it('should call updateListing on ListingService', async () => {
    const updateListing = ListingFixture.getFakeUpdateDto();
    await controller.updateListing(updateListing);
    expect(listingService.updateListing).toHaveBeenCalledWith(updateListing);
  });

  it('should call deleteListing on ListingService', async () => {
    const deleteListing = {
      id: faker.datatype.uuid(),
    };
    await controller.deleteListing(deleteListing);
    expect(listingService.deleteListing).toHaveBeenCalledWith(deleteListing);
  });
});
