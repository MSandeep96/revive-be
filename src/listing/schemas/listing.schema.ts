import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Platform } from '../../game/interface/game.interface';
import { LocationSchema } from '../../user/schemas/user.schema';
import { ListingType, RentingPeriod } from '../interface/listing.interface';

export type ListingDocument = Listing & Document;

class SaleDetails {
  @Prop()
  price: number;
}

class RentDetails {
  @Prop()
  price: number;
  @Prop()
  period: RentingPeriod;
}

export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: string;
  @Prop({ required: true })
  slug: string;
  @Prop({ required: true })
  platform: Platform;
  @Prop({ required: true })
  location: LocationSchema;
  @Prop({ required: true })
  listingType: ListingType[];
  @Prop()
  saleDetails?: SaleDetails;
  @Prop()
  rentDetails?: RentDetails;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
ListingSchema.index({ location: '2dsphere' });
