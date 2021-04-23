import { User } from 'src/user/schemas/user.schema';

export type AccessTokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtContent = {
  user_id: string;
};

export interface IApiGoogleLoginResponse extends User, AccessTokens {}
