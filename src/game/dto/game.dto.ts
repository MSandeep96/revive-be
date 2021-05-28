import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Platform } from '../interface/game.interface';

export class GameSearchQuery {
  @Length(3)
  name: string;

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value.split(',');
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(Object.values(Platform), {
    each: true,
  })
  platforms;
}

export class FetchGameQuery {
  @IsOptional()
  @IsString()
  slug: string;
}
