import {
  Body,
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
import { IRequestWithProfile } from '../user/interfaces/controller.interface';
import {
  CreateListingDto,
  DeleteListingDto,
  FetchGameListingQueryDto,
  FetchGeoListingQueryDto,
  FetchListingQueryDto,
  UpdateListingDto,
} from './dto/listing.dto';
import { ListingService } from './listing.service';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Put()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() listingDto: CreateListingDto) {
    return await this.listingService.createListing(listingDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async fetchListings(
    @Req() req: IRequestWithProfile,
    @Query() fetchListing: FetchListingQueryDto,
  ) {
    return await this.listingService.fetchListings(fetchListing, req.user);
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

  @Post()
  @UseGuards(JwtAuthGuard)
  async updateListing(@Req() req, @Body() updateListingDto: UpdateListingDto) {
    await this.listingService.updateListing(req.user, updateListingDto);
    return;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteListing(@Req() req, @Query() deleteListingDto: DeleteListingDto) {
    this.listingService.deleteListing(req.user, deleteListingDto);
  }
}
