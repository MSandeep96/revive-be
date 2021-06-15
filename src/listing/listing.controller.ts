import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import { IRequestWithProfile } from '../user/interfaces/controller.interface';
import {
  DeleteListingDto,
  FetchGameListingQueryDto,
  FetchGeoListingQueryDto,
  FetchListingQueryDto,
  FetchUserListingQueryDto,
  UpsertListingDto,
} from './dto/listing.dto';
import { ListingService } from './listing.service';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async fetchListings(
    @Req() req: IRequestWithProfile,
    @Query() fetchListing: FetchListingQueryDto,
  ) {
    return await this.listingService.fetchListings(fetchListing, req.user);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async fetchUserListings(
    @Req() req: IRequestWithProfile,
    @Query() fetchUserListing: FetchUserListingQueryDto,
  ) {
    if (fetchUserListing.slug && fetchUserListing.platform) {
      return await this.listingService.fetchUserListing(
        fetchUserListing,
        req.user,
      );
    }
    return await this.listingService.fetchAllUserListings(req.user);
  }

  @Get('game')
  async fetchGameListings(
    @Query() fetchGameListingQuery: FetchGameListingQueryDto,
  ) {
    return await this.listingService.fetchGameListings(fetchGameListingQuery);
  }

  @Get('map')
  async fetchGeo(@Query() fetchGeoListingQuery: FetchGeoListingQueryDto) {
    return await this.listingService.fetchGeo(fetchGeoListingQuery);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async upsertListing(@Req() req, @Body() upsertListingDto: UpsertListingDto) {
    await this.listingService.upsertListing(req.user, upsertListingDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteListing(@Req() req, @Query() deleteListingDto: DeleteListingDto) {
    this.listingService.deleteListing(req.user, deleteListingDto);
  }
}
