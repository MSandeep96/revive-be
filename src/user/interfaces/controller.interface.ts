import { UserDocument } from '../schemas/user.schema';

export interface IRequestWithProfile extends Express.Request {
  user: UserDocument;
}
