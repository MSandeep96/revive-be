import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Platform } from '../../game/interface/game.interface';

export type WishlistDocument = Wishlist & Document;

@Schema()
export class Wishlist {
  @Prop({ type: Types.ObjectId, required: true })
  userId: string;
  @Prop({ required: true })
  slug: string;
  @Prop({ required: true })
  platform: Platform;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
