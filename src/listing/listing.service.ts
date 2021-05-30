import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../user/schemas/user.schema';
import {
  CreateListingDto,
  DeleteListingDto,
  FetchGameListingQueryDto,
  FetchGeoListingQueryDto,
  FetchListingQueryDto,
  ListingDetailsDto,
  UpdateListingDto,
} from './dto/listing.dto';
import { ListingSort, ListingType } from './interface/listing.interface';
import { Listing, ListingDocument } from './schemas/listing.schema';

const queryAllListings = (queryDto) => ({
  $geoNear: {
    near: {
      type: 'Point',
      coordinates: [queryDto.long, queryDto.lat],
    },
    maxDistance: 15000,
    distanceField: 'distance',
  },
});

@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  async createListing(listingDto: CreateListingDto, user: UserDocument) {
    this.checkIfValidListing(listingDto);
    const listing: Listing = {
      ...listingDto,
      location: user.location,
      createdBy: user._id,
    };
    return await this.listingModel.create(listing);
  }

  async fetchListings(fetchListing: FetchListingQueryDto, user: UserDocument) {
    const pageLength = fetchListing.pageLength ?? 40;
    let sort;
    switch (fetchListing.sort) {
      case ListingSort.LATEST:
        sort = { _id: 1 };
        break;
      case ListingSort.NEAREST:
        sort = {
          location: 1,
        };
        break;
      default:
        sort = {
          'rentDetails.price': 1,
          'saleDetails.price': 1,
        };
    }
    return await this.listingModel
      .find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [
                user.location.coordinates[0],
                user.location.coordinates[1],
              ],
            },
            $maxDistance: fetchListing.distance * 1000,
          },
        },
        listingType: { $in: fetchListing.listingTypes },
        platform: { $in: user.platforms },
      })
      .sort(sort)
      .skip(fetchListing.pageNo ? (fetchListing.pageNo - 1) * pageLength : 0)
      .limit(pageLength)
      .exec();
  }

  async fetchGeo(queryDto: FetchGeoListingQueryDto) {
    return await this.listingModel
      .aggregate([
        queryAllListings(queryDto),
        {
          $group: {
            _id: '$createdBy',
            location: { $first: '$location' },
            distance: { $first: '$distance' },
            games: { $push: '$$ROOT' },
          },
        },
      ])
      .limit(20)
      .exec();
  }

  async fetchGameListings(queryDto: FetchGameListingQueryDto) {
    return await this.listingModel
      .find({
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
      })
      .exec();
  }

  async updateListing(user: UserDocument, listingDto: UpdateListingDto) {
    this.checkIfValidListing(listingDto);
    const listing = await this.listingModel
      .findOne({
        createdBy: user._id,
        platform: listingDto.platform,
        slug: listingDto.slug,
      })
      .exec();
    if (!listing) {
      throw new BadRequestException(`Couldn't find requested listing`);
    }
    delete listing.rentDetails;
    delete listing.saleDetails;
    listing.listingType = listingDto.listingType;
    listing.saleDetails = listingDto.saleDetails;
    listing.rentDetails = listingDto.rentDetails;
    await listing.save();
  }

  async deleteListing(user: UserDocument, listingDto: DeleteListingDto) {
    this.listingModel
      .deleteOne({
        ...listingDto,
        createdBy: user._id,
      })
      .exec();
  }

  checkIfValidListing(listingDto: ListingDetailsDto) {
    if (listingDto.listingType.includes(ListingType.SALE)) {
      if (!listingDto.saleDetails)
        throw new BadRequestException('Sale details required');
    }
    if (listingDto.listingType.includes(ListingType.RENT)) {
      if (!listingDto.rentDetails)
        throw new BadRequestException('Rent details required');
    }
  }
}
