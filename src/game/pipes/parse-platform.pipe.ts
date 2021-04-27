import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Platform } from '../interface/game.interface';

@Injectable()
export class ParsePlatform implements PipeTransform {
  transform(values: string): Platform[] {
    const platforms = Object.values(Platform);
    if ([undefined, ''].includes(values)) {
      return platforms;
    }
    let plats = [...values.split(',')];
    plats.forEach((val) => {
      if (!platforms.includes(val as Platform))
        throw new BadRequestException('Invalid platforms value');
    });
    plats = [...new Set(plats)];
    return plats as Platform[];
  }
}
