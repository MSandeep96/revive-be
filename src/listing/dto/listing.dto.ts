import {
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Platform } from '../../game/interface/game.interface';
import { ListingType, RentingPeriod } from '../interface/listing.interface';

class SaleDetailsDto {
  @IsNumber()
  @Max(10000)
  @Min(0)
  price: number;
}

class RentDetailsDto extends SaleDetailsDto {
  @IsEnum(RentingPeriod)
  period: RentingPeriod;
}

export class ListingDetailsDto {
  @IsIn(Object.values(ListingType), {
    each: true,
  })
  listingType: ListingType[];
  @ValidateNested()
  saleDetails?: SaleDetailsDto;
  @ValidateNested()
  rentDetails?: RentDetailsDto;
}

export class CreateListingDto extends ListingDetailsDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
}

export class UpdateListingDto extends ListingDetailsDto {
  @IsUUID()
  id: string;
}

export class FetchListingQueryDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
  @IsLongitude()
  long: number;
  @IsLatitude()
  lat: number;
}

export class DeleteListingDto {
  @IsUUID()
  id: string;
}
