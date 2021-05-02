import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { Listing, ListingSchema } from './schemas/listing.schema';

@Module({
  controllers: [ListingController],
  providers: [ListingService],
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
  ],
})
export class ListingModule {}
