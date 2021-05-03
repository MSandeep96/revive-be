import * as faker from 'faker';
import { Model } from 'mongoose';
import { UserDocument } from '../../src/user/schemas/user.schema';

export class UserFixture {
  static async getUser(userModel: Model<UserDocument>) {
    return await userModel.create({
      email: faker.internet.email(),
    });
  }

  static async getUserWithLocation(userModel: Model<UserDocument>) {
    return await userModel.create({
      email: faker.internet.email(),
      location: {
        type: 'Point',
        coordinates: [
          Number(faker.address.longitude()),
          Number(faker.address.latitude()),
        ],
      },
    });
  }
}
