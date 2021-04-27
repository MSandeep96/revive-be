import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import slugify from 'slugify';
import { Platform } from '../../game/interface/game.interface';
import { RepoGameResponse, RepoProvider } from '../interface/repo.interface';

const RAWG_API = 'https://api.rawg.io/api/games';
const toRawgPlatformMap = new Map<Platform, number>([
  [Platform.PS4, 18],
  [Platform.XBOX_1, 1],
  [Platform.PS5, 187],
  [Platform.XBOX_X, 186],
]);

const fromRawgPlatformMap = new Map<number, Platform>(
  Array.from(toRawgPlatformMap, (e) => e.reverse()) as any,
);

@Injectable()
export class RawgService implements RepoProvider {
  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(RawgService.name) private logger: PinoLogger,
  ) {}

  init() {
    //stub
  }

  async search(
    name: string,
    platform: Platform[],
  ): Promise<RepoGameResponse[]> {
    const resp = await axios.get(RAWG_API, {
      params: this.getQueryParams(name, platform),
    });
    return resp.data.results.map(this.mapToSchema);
  }

  mapToSchema(gameResp): RepoGameResponse {
    const platforms = gameResp.platforms
      .filter(({ platform }) => fromRawgPlatformMap.has(platform.id))
      .map(({ platform }) => fromRawgPlatformMap.get(platform.id));
    const release = new Date(`${gameResp.released} 00:00`);
    return {
      slug: slugify(gameResp.name, { strict: true, lower: true }),
      name: gameResp.name,
      artwork: gameResp.background_image,
      platforms,
      release,
      rating: gameResp.rating * 20,
    };
  }

  getQueryParams(name: string, plats: Platform[]) {
    const platforms = plats
      .map((plat) => toRawgPlatformMap.get(plat))
      .join(',');
    return {
      key: this.configService.get('RAWG_API_KEY'),
      search: name,
      platforms,
    };
  }
}
