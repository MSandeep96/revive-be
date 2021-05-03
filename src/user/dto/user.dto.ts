import { IsLatitude, IsLongitude } from 'class-validator';

export class UserLocationDto {
  @IsLatitude()
  latitude;

  @IsLongitude()
  longitude;
}
