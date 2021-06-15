import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../game/schemas/game.schema';
import { UserDocument } from '../user/schemas/user.schema';
import {
  DeleteListingDto,
  FetchGameListingQueryDto,
  FetchGeoListingQueryDto,
  FetchListingQueryDto,
  FetchUserListingQueryDto,
  ListingDetailsDto,
  UpsertListingDto,
} from './dto/listing.dto';
import { ListingSort, ListingType } from './interface/listing.interface';
import { Listing, ListingDocument } from './schemas/listing.schema';

const queryAllListings = (queryDto) => ({
  $geoNear: {
    near: {
      type: 'Point',
      coordinates: [queryDto.lng, queryDto.lat],
    },
    maxDistance: 15000,
    distanceField: 'distance',
  },
});

@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
  ) {}

  async upsertListing(user: UserDocument, listingDto: UpsertListingDto) {
    this.checkIfValidListing(listingDto);
    const listing = await this.listingModel
      .findOne({
        createdBy: user._id,
        platform: listingDto.platform,
        slug: listingDto.slug,
      })
      .exec();
    if (!listing) {
      const game = await this.gameModel
        .findOne({ slug: listingDto.slug })
        .exec();
      const newListing: Listing = {
        ...listingDto,
        location: user.location,
        createdBy: user._id,
        createdAt: new Date(),
        gameName: game.name,
        artwork: game.artwork,
      };
      return await this.listingModel.create(newListing);
    }
    delete listing.rentDetails;
    delete listing.saleDetails;
    listing.listingType = listingDto.listingType;
    listing.saleDetails = listingDto.saleDetails;
    listing.rentDetails = listingDto.rentDetails;
    await listing.save();
  }

  async fetchUserListing(
    fetchUserListing: FetchUserListingQueryDto,
    user: UserDocument,
  ): Promise<Listing> {
    const queryObj = {
      createdBy: user._id,
    };
    const listing = await this.listingModel
      .findOne({
        ...queryObj,
        slug: fetchUserListing.slug,
        platform: fetchUserListing.platform,
      })
      .exec();
    if (listing) {
      return listing;
    }
    return {} as Listing;
  }

  async fetchAllUserListings(user: UserDocument) {
    return await this.listingModel
      .find({
        createdBy: user._id,
      })
      .exec();
  }

  getSortObject(fetchListing: FetchListingQueryDto) {
    let sort = {};
    switch (fetchListing.sort) {
      case ListingSort.LATEST:
        sort = { _id: -1 };
        break;
      case ListingSort.NEAREST:
        sort = {
          distance: 1,
          _id: 1,
        };
        break;
      default:
        if (fetchListing.listingTypes.includes(ListingType.RENT))
          sort = { 'rentDetails.price': 1, ...sort };
        if (fetchListing.listingTypes.includes(ListingType.SALE))
          sort = {
            'saleDetails.price': 1,
            ...sort,
          };
        sort = { ...sort, _id: 1 };
    }
    return sort;
  }

  getMatchObject(fetchListing: FetchListingQueryDto, user: UserDocument) {
    const match: any = {
      listingType: { $in: fetchListing.listingTypes },
      platform: { $in: user.platforms },
      createdBy: { $ne: user._id },
    };
    if (fetchListing.slug) {
      match.slug = fetchListing.slug;
    }
    if (fetchListing.platform) {
      match.platform = fetchListing.platform;
    }
    return match;
  }

  async fetchListings(fetchListing: FetchListingQueryDto, user: UserDocument) {
    const pageLength = fetchListing.pageLength ?? 40;
    const skip = fetchListing.pageNo
      ? (fetchListing.pageNo - 1) * pageLength
      : 0;
    const limit = pageLength;
    const results = await this.listingModel
      .aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [
                user.location.coordinates[0],
                user.location.coordinates[1],
              ],
            },
            maxDistance: fetchListing.distance * 1000,
            distanceField: 'distance',
          },
        },
        {
          $match: this.getMatchObject(fetchListing, user),
        },
        { $sort: this.getSortObject(fetchListing) },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            results: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            pageCount: { $ceil: { $divide: ['$count', pageLength] } },
            results: { $slice: ['$results', skip, limit] },
          },
        },
      ])
      .exec();
    if (Array.isArray(results) && results.length === 0) {
      return {
        pageCount: 0,
        results: [],
      };
    }
    return results[0];
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
              coordinates: [queryDto.lng, queryDto.lat],
            },
            $maxDistance: 15000,
          },
        },
      })
      .exec();
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
