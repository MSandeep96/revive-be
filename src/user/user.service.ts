import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { JwtContent } from 'src/auth/auth.service';
import { User, UserDocument } from './schemas/user.schema';
import { UserLoginDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async getUserByPhone(phone: string): Promise<UserDocument> {
    return this.userModel.findOne({ phone }).exec();
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(user: UserLoginDto): Promise<UserDocument> {
    return await this.userModel.create(user);
  }

  async getUserByJwt(user): Promise<UserDocument> {
    return await this.findById(user.user_id);
  }
}
