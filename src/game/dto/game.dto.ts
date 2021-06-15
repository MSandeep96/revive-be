import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { Platform } from '../interface/game.interface';

export class GameSearchQuery {
  @Length(3)
  name: string;
}

export class FetchGameQuery {
  @IsString()
  slug: string
  @IsIn(Object.values(Platform))
  platform: Platform;
}
