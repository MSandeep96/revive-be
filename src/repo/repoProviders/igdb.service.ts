import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import slugify from 'slugify';
import { Platform } from '../../game/interface/game.interface';
import { RepoGameResponse, RepoProvider } from '../interface/repo.interface';

const IGDB_API = 'https://api.Igdb.com/v4/games';
const OAUTH_API = 'https://id.twitch.tv/oauth2/token';
const toIgdbPlatformMap = new Map([
  [Platform.PS4, 48],
  [Platform.XBOX_1, 49],
  [Platform.PS5, 167],
  [Platform.XBOX_X, 169],
]);
const fromIgdbPlatformMap = new Map(
  Array.from(toIgdbPlatformMap, (e) => e.reverse()) as any,
);

@Injectable()
export class IGDBService implements RepoProvider {
  access_token;
  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(IGDBService.name) private logger: PinoLogger,
  ) {}

  async init() {
    await this.authenticate();
  }

  //call endpoint of IGDB
  async callApi(name: string, platforms: Platform[]) {
    const config = {
      headers: {
        Authorization: `Bearer ${this.access_token}`,
        'Client-ID': this.configService.get('TWITCH_CLIENT_ID'),
      },
    };
    return await axios.post(
      IGDB_API,
      this.getQueryBody(name, platforms),
      config,
    );
  }

  //call endpoint with reauthentication on 401
  async search(
    name: string,
    platforms: Platform[],
  ): Promise<RepoGameResponse[]> {
    let resp;
    try {
      resp = await this.callApi(name, platforms);
    } catch (e) {
      if (e.response.status === 401) {
        await this.authenticate();
        resp = await this.callApi(name, platforms);
      } else {
        throw e;
      }
    }
    return resp.data
      .filter((game) => game?.artworks?.[0]) //check if game has artwork
      .map(this.mapToSchema);
  }

  /* istanbul ignore next */
  async authenticate() {
    if (process.env.NODE_ENV !== 'production') {
      this.access_token = this.configService.get('TWITCH_ACCESS_TOKEN');
      return;
    }
    const resp = await axios.post(OAUTH_API, {
      params: {
        client_id: this.configService.get('TWITCH_CLIENT_ID'),
        client_secret: this.configService.get('TWITCH_CLIENT_SECRET'),
        grant_type: 'client_credentials',
      },
    });
    this.access_token = resp.data.access_token;
  }

  //maps api response to schema
  mapToSchema(gameResp): RepoGameResponse {
    const platforms = gameResp.platforms
      .filter((id) => fromIgdbPlatformMap.has(id))
      .map((id) => fromIgdbPlatformMap.get(id));
    const release = new Date(gameResp.first_release_date * 1000);
    const game_img = gameResp.artworks[0]
      ? `https:${gameResp.artworks[0].url.replace('t_thumb', 't_720p')}`
      : undefined;
    return {
      slug: slugify(gameResp.name, { strict: true, lower: true }),
      name: gameResp.name,
      artwork: game_img,
      platforms,
      release,
      rating: gameResp.aggregated_rating,
      description: gameResp.summary,
    };
  }

  getQueryBody(name: string, plats: Platform[]) {
    const platforms = plats
      .map((plat) => toIgdbPlatformMap.get(plat))
      .join(',');
    return `fields aggregated_rating,first_release_date,name,platforms,summary,artworks.url;
      where platforms=(${platforms}) & name~"${name}"*;`;
  }
}
