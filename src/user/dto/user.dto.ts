import {
  ArrayNotEmpty,
  IsAlphanumeric,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsString,
  Length,
} from 'class-validator';
import { Platform } from '../../game/interface/game.interface';

export class UserLocationDto {
  @IsLatitude()
  latitude;

  @IsLongitude()
  longitude;
}

export class UsernameDto {
  @IsString()
  @Length(5, 12)
  @IsAlphanumeric()
  username;
}

export class PlatformsDto {
  @ArrayNotEmpty()
  @IsIn(Object.values(Platform), {
    each: true,
  })
  platforms;
}
