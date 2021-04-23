import { UserDocument } from '../schemas/user.schema';

export interface IRequestGetProfile extends Express.Request {
  user: UserDocument;
}
