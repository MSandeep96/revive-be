import { Test, TestingModule } from '@nestjs/testing';
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
    await controller.fetchGameListings(query);
    expect(listingService.fetchGameListings).toHaveBeenCalledWith(query);
  });

  it('should call updateListing on ListingService', async () => {
    const updateListing = ListingFixture.getFakeUpdateDto();
    const req = {
      user: jest.fn(),
    };
    await controller.upsertListing(req, updateListing);
    expect(listingService.upsertListing).toHaveBeenCalledWith(
      req.user,
      updateListing,
    );
  });

  it('should call deleteListing on ListingService', async () => {
    const deleteListing = ListingFixture.getFakeDeleteDto();
    const req = {
      user: jest.fn(),
    };
    await controller.deleteListing(req, deleteListing);
    expect(listingService.deleteListing).toHaveBeenCalledWith(
      req.user,
      deleteListing,
    );
  });
});
