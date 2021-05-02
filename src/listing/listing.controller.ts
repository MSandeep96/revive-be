import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import {
  CreateListingDto,
  DeleteListingDto,
  FetchListingQueryDto,
  UpdateListingDto,
} from './dto/listing.dto';
import { ListingService } from './listing.service';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, listingDto: CreateListingDto) {
    return await this.listingService.createListing(listingDto, req.user);
  }

  @Get()
  async fetchListings(@Query() fetchListingQuery: FetchListingQueryDto) {
    return await this.listingService.fetchListings(fetchListingQuery);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async updateListing(updateListingDto: UpdateListingDto) {
    await this.listingService.updateListing(updateListingDto);
    return;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteListing(@Query() deleteListingDto: DeleteListingDto) {
    this.listingService.deleteListing(deleteListingDto);
  }
}
