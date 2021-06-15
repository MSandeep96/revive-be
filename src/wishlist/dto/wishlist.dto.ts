import { IsIn, IsString } from 'class-validator';
import { Platform } from '../../game/interface/game.interface';

export class ToggleWishlistDto {
  @IsString()
  slug: string;
  @IsIn(Object.values(Platform))
  platform: Platform;
}
