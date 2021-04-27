import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RepoService } from '../repo/repo.service';
import { OnRepoFirstReturnFn, Platform } from './interface/game.interface';
import { Game, GameDocument } from './schemas/game.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private repoService: RepoService,
    @InjectPinoLogger(GameService.name) private logger: PinoLogger,
  ) {
    repoService.init();
  }

  async searchDatabase(name: string, platforms: Platform[]) {
    return await this.gameModel
      .find({ $text: { $search: name }, platform: { $in: platforms } })
      .exec();
  }

  async searchRepos(
    name: string,
    platforms: Platform[],
    onRepoFirstReturnFn: OnRepoFirstReturnFn,
  ) {
    const games = await this.repoService.search(
      name,
      platforms,
      onRepoFirstReturnFn,
    );
    const upsertGames = games.map((game) => {
      return this.gameModel
        .updateOne({ slug: game.slug, platform: game.platform }, game, {
          upsert: true,
        })
        .exec();
    });
    try {
      await Promise.all(upsertGames);
    } catch (err) {
      this.logger.error(err, 'Error writing games to database');
    }
  }
}
