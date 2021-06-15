import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FetchGameQuery } from '../game/dto/game.dto';
import { GameWithWishlist } from '../game/interface/game.interface';
import { Game } from '../game/schemas/game.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { ToggleWishlistDto } from './dto/wishlist.dto';
import { Wishlist, WishlistDocument } from './schema/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
  ) {}

  async getWishlistStatus(
    user: UserDocument,
    getWishlistStatusDto: FetchGameQuery,
  ) {
    const wishlist = await this.wishlistModel
      .findOne({
        slug: getWishlistStatusDto.slug,
        platform: getWishlistStatusDto.platform,
        userId: user._id,
      })
      .exec();
    if (wishlist) {
      return true;
    } else {
      return false;
    }
  }

  async toggleWishlist(
    user: UserDocument,
    toggleWishlistDto: ToggleWishlistDto,
  ) {
    const wishList = await this.wishlistModel
      .findOne({
        slug: toggleWishlistDto.slug,
        platform: toggleWishlistDto.platform,
        userId: user._id,
      })
      .exec();
    if (wishList) {
      wishList.delete();
      return;
    }
    await this.wishlistModel.create({
      userId: user._id,
      slug: toggleWishlistDto.slug,
      platform: toggleWishlistDto.platform,
    });
  }

  async populateWithWishlist(
    games: Game[],
    user: UserDocument,
  ): Promise<GameWithWishlist[]> {
    const wishlistItems = await this.wishlistModel
      .find({
        slug: { $in: games.map((game) => game.slug) },
        userId: user._id,
      })
      .exec();
    return games.map((gameDoc: GameWithWishlist) => {
      const game = gameDoc;
      const item = wishlistItems.find(
        (element) =>
          element.slug === game.slug && element.platform === game.platform,
      );
      if (item) game.wishlist = true;
      else game.wishlist = false;
      return game;
    });
  }
}
