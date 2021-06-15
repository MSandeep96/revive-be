import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Platform } from '../../game/interface/game.interface';

export type UserDocument = User & Document;

export class LocationSchema {
  @Prop()
  type?: string;
  @Prop()
  coordinates: number[];
}
@Schema()
export class User {
  @Prop()
  phone?: string;
  @Prop()
  email?: string;
  @Prop()
  username: string;
  @Prop()
  location?: LocationSchema;
  @Prop()
  isNewUser?: boolean;
  @Prop()
  platforms?: Platform[];
  @Prop()
  wishlist: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
