import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../game/schemas/game.schema';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { Listing, ListingSchema } from './schemas/listing.schema';

@Module({
  controllers: [ListingController],
  providers: [ListingService],
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
})
export class ListingModule {}
