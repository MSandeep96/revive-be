import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { IApiGoogleLoginResponse, JwtContent } from './interfaces/types';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // async loginPhone(phone: string, password: string) {}

  async loginGoogle(email: string): Promise<IApiGoogleLoginResponse> {
    let user: UserDocument = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.userModel.create({ email });
    }
    const access_token = this.generateAccessToken(user._id);
    const refresh_token = this.generateRefreshToken(user._id);
    const userResp: IApiGoogleLoginResponse = {
      ...user.toObject(),
      access_token,
      refresh_token,
    };
    return userResp;
  }

  generateAccessToken(_id: string): string {
    const payload: JwtContent = { user_id: _id };
    return this.jwtService.sign(payload, { expiresIn: '6h' });
  }

  generateRefreshToken(_id: string): string {
    const payload: JwtContent = { user_id: _id };
    return this.jwtService.sign(payload, { expiresIn: '10d' });
  }
}
