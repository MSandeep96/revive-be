import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../user/schemas/user.schema';
import {
  CreateListingDto,
  DeleteListingDto,
  FetchListingQueryDto,
  UpdateListingDto,
} from './dto/listing.dto';
import { Listing, ListingDocument } from './schemas/listing.schema';

@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  async createListing(listingDto: CreateListingDto, user: UserDocument) {
    const listing: Listing = {
      ...listingDto,
      location: user.location,
      createdBy: user._id,
    };
    return await this.listingModel.create(listing);
  }

  async fetchListings(queryDto: FetchListingQueryDto) {
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

  async updateListing(listingDto: UpdateListingDto) {
    const listing = await this.listingModel
      .findOne({ _id: listingDto.id })
      .exec();
    if (!listing) {
      throw new BadRequestException(
        `No listing exists with id: ${listingDto.id}`,
      );
    }
    delete listing.rentDetails;
    delete listing.saleDetails;
    listing.listingType = listingDto.listingType;
    listing.saleDetails = listingDto.saleDetails;
    listing.rentDetails = listingDto.rentDetails;
    await listing.save();
  }

  async deleteListing(listingDto: DeleteListingDto) {
    this.listingModel.deleteOne({ _id: listingDto.id }).exec();
  }
}
