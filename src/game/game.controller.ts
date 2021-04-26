import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { GameService } from './game.service';
import { ParsePlatform } from './pipes/parse-platform.pipe';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService, private logger: PinoLogger) {}

  @Get('search')
  async search(
    @Query('name') name: string,
    @Query('platform', ParsePlatform) platform,
    @Res() res: Response,
  ) {
    const games = await this.gameService.searchDatabase(name, platform);
    if (games.length > 4) {
      this.logger.info('search returned from database');
      res.status(200).send(games);
      return;
    }
    await this.gameService.searchRepos(
      name,
      platform,
      (repoGames, serviceName) => {
        this.logger.info(`search returned from service ${serviceName}`);
        res.status(200).send(repoGames);
      },
    );
  }
}
