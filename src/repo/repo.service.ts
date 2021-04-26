import { Injectable } from '@nestjs/common';
import { Platform } from '../game/interface/game.interface';
import { Game } from '../game/schemas/game.schema';
import { RepoGameResponse, RepoProvider } from './interface/repo.interface';
import { IGDBService } from './repoProviders/igdb.service';
import { RawgService } from './repoProviders/rawg.service';

@Injectable()
export class RepoService {
  private repoProviders: [RepoProvider, string][] = [];
  private hasBeenInitialized = false;

  constructor(
    private rawgService: RawgService,
    private igdbService: IGDBService,
  ) {
    this.repoProviders.push([this.rawgService, RawgService.name]);
    this.repoProviders.push([this.igdbService, IGDBService.name]);
  }

  async init() {
    this.hasBeenInitialized = true;
    await Promise.all(this.repoProviders.map(([provider]) => provider.init()));
  }

  async search(
    name: string,
    platforms: Platform[],
    onFirstReturnFn,
  ): Promise<Game[]> {
    if (!this.hasBeenInitialized)
      throw new Error(
        `${RepoService.name} has to be initialized by calling init() before usage`,
      );
    const repoProvidersWrapper = new RepoProvidersWrapper(
      onFirstReturnFn,
      platforms,
    );
    const repoSearchPromises = this.repoProviders.map(
      ([provider, providerName]) =>
        provider
          .search(name, platforms)
          .then((games) => repoProvidersWrapper.onResolve(games, providerName)),
    );
    await Promise.all(repoSearchPromises);
    return repoProvidersWrapper.getResults();
  }

  static mapRepoGameToGameSchema(repoGames: RepoGameResponse[]): Game[] {
    let games: Game[] = [];
    repoGames.forEach((repoGame) => {
      const gameForPlatforms: Game[] = repoGame.platforms.map(
        (platform): Game => {
          const game = { ...repoGame, platform };
          delete game.platforms;
          return game as Game;
        },
      );
      games = games.concat(gameForPlatforms);
    });
    return games;
  }
}

class RepoProvidersWrapper {
  private firstReturnFn;
  private platforms: Platform[];
  private hasFirstReturned = false;
  private results: RepoGameResponse[] = [];
  constructor(firstReturnFn, platforms) {
    this.firstReturnFn = firstReturnFn;
    this.platforms = platforms;
  }

  onResolve = (repoGames: RepoGameResponse[], providerName) => {
    if (!this.hasFirstReturned) {
      if (repoGames.length === 0) return;
      this.hasFirstReturned = true;
      let games = RepoService.mapRepoGameToGameSchema(repoGames);
      games = games.filter((game) => this.platforms.includes(game.platform));
      this.firstReturnFn(games, providerName);
    }
    this.results = this.results.concat(repoGames);
  };

  getResults() {
    const slugMap = new Map<string, RepoGameResponse>();
    this.results.forEach((game) => {
      if (slugMap.has(game.slug)) {
        slugMap.set(game.slug, { ...slugMap.get(game.slug), ...game });
      } else {
        slugMap.set(game.slug, game);
      }
    });
    const repoGames = Array.from(slugMap.values());
    return RepoService.mapRepoGameToGameSchema(repoGames);
  }
}
