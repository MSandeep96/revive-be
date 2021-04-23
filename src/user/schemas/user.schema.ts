import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & UserStaticMethods;

interface UserStaticMethods {
  getObject: () => User;
}
@Schema()
export class User {
  @Prop()
  phone: string;
  @Prop()
  email: string;
  @Prop()
  username: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.getObject = function (this: UserDocument): User {
  const user = this.toObject();
  delete user._id;
  delete user.__v;
  return user;
};
