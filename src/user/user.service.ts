import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformsDto, UserLocationDto, UsernameDto } from './dto/user.dto';
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

  async updateUsername(user: UserDocument, usernameDto: UsernameDto) {
    const usernameUser = await this.userModel
      .findOne({ username: usernameDto.username, _id: { $ne: user._id } })
      .exec();
    if (usernameUser) {
      throw new BadRequestException('Username already taken');
    }
    user.username = usernameDto.username;
    user.isNewUser = false;
    await user.save();
  }

  async updatePlatforms(user: UserDocument, platformsDto: PlatformsDto) {
    user.platforms = platformsDto.platforms;
    await user.save();
  }
}
