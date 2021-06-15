import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Platform } from '../../game/interface/game.interface';
import {
  ListingSort,
  ListingType,
  RentingPeriod,
} from '../interface/listing.interface';

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

export class UpsertListingDto extends ListingDetailsDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
}

export class FetchListingQueryDto {
  @IsString()
  @IsIn(Object.values(ListingSort))
  sort: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsIn([5, 10, 15, 20])
  distance: number;

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value.split(',');
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(Object.values(ListingType), {
    each: true,
  })
  listingTypes: ListingType[];

  @IsString()
  @IsOptional()
  slug: string;

  @IsIn(Object.values(Platform))
  @IsOptional()
  platform: Platform;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  pageNo: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(40)
  pageLength: number;
}

export class FetchGeoListingQueryDto {
  @Type(() => Number)
  @IsLongitude()
  lng: number;
  @Type(() => Number)
  @IsLatitude()
  lat: number;
}

export class FetchGameListingQueryDto extends FetchGeoListingQueryDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
}

export class DeleteListingDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
}

export class FetchUserListingQueryDto {
  @IsString()
  @IsOptional()
  slug: string;
  @IsIn(Object.values(Platform))
  @IsOptional()
  platform: Platform;
}
