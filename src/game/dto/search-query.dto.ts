import { Transform } from 'class-transformer';
import { ArrayUnique, IsArray, IsIn, Length } from 'class-validator';
import { Platform } from '../interface/game.interface';

export class GameSearchQuery {
  @Length(3)
  name: string;

  @Transform(({ value }) => {
    value.split(',');
  })
  @IsArray()
  @ArrayUnique()
  @IsIn(Object.values(Platform), {
    each: true,
  })
  platforms;
}
