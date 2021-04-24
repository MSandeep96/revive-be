import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private configService: ConfigService,
  ) {}

  // async loginPhone(phone: string, password: string) {}

  async loginGoogle(email: string): Promise<IApiGoogleLoginResponse> {
    let user: UserDocument = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.userModel.create({ email });
    }
    const access_token = this.generateAccessToken(user._id);
    const refresh_token = this.generateAccessToken(user._id, true);
    const userResp: IApiGoogleLoginResponse = {
      ...user.toObject(),
      access_token,
      refresh_token,
    };
    return userResp;
  }

  generateAccessToken(_id: string, is_refresh = false): string {
    const payload: JwtContent = { user_id: _id };
    const expiresIn = is_refresh
      ? this.configService.get('REFRESH_TOKEN_DURATION')
      : this.configService.get('ACCESS_TOKEN_DURATION');
    return this.jwtService.sign(payload, { expiresIn });
  }
}
