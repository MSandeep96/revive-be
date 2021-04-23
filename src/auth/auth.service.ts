import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import {
  AccessTokens,
  IApiGoogleLoginResponse,
  JwtContent,
} from './interfaces/types';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // async loginPhone(phone: string, password: string) {}

  async loginGoogle(email: string): Promise<IApiGoogleLoginResponse> {
    let user: UserDocument = await this.userService.getUserByEmail(email);
    if (!user) {
      user = await this.userService.createUser({ email });
    }
    const accTokens = this.generateAccessTokens(user._id);
    const userObj = user.getObject();
    const userResp: IApiGoogleLoginResponse = { ...userObj, ...accTokens };
    return userResp;
  }

  generateAccessTokens(_id: string): AccessTokens {
    const payload: JwtContent = { user_id: _id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '6h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '10 days' }),
    };
  }
}
