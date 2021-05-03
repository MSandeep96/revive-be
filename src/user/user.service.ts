import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLocationDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async addLocation(user: UserDocument, location: UserLocationDto) {
    user.location = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    };
    await user.save();
  }
}
