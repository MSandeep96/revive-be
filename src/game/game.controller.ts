import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { FetchGameQuery, GameSearchQuery } from './dto/game.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService, private logger: PinoLogger) {}

  @Get('search')
  async search(@Query() searchQuery: GameSearchQuery, @Res() res: Response) {
    const games = await this.gameService.searchDatabase(
      searchQuery.name,
      searchQuery.platforms,
    );
    if (games.length > 4) {
      this.logger.info('search returned from database');
      res.status(200).send(games);
      return;
    }
    await this.gameService.searchRepos(
      searchQuery.name,
      searchQuery.platforms,
      (repoGames, serviceName) => {
        this.logger.info(`search returned from service ${serviceName}`);
        res.status(200).send(repoGames);
      },
    );
  }

  @Get()
  async fetchGame(@Query() fetchGameQuery: FetchGameQuery) {
    return await this.gameService.fetchGame(fetchGameQuery);
  }
}
