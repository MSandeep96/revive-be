import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistModule } from '../wishlist/wishlist.module';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    WishlistModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
