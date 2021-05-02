import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class LocationSchema {
  @Prop({ default: 'point' })
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
  username?: string;
  @Prop()
  location?: LocationSchema;
}

export const UserSchema = SchemaFactory.createForClass(User);
