import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, WishlistSchema } from './schema/wishlist.schema';
import { WishlistService } from './wishlist.service';

@Module({
  providers: [WishlistService],
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
    ]),
  ],
  exports: [WishlistService],
})
export class WishlistModule {}
