import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../user/schemas/user.schema';
import {
  CreateListingDto,
  DeleteListingDto,
  FetchListingQueryDto,
  ListingDetailsDto,
  UpdateListingDto,
} from './dto/listing.dto';
import { ListingType } from './interface/listing.interface';
import { Listing, ListingDocument } from './schemas/listing.schema';

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
