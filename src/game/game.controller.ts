import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/strategy/jwt.strategy';
import { IRequestWithProfile } from '../user/interfaces/controller.interface';
import { WishlistService } from '../wishlist/wishlist.service';
import { FetchGameQuery, GameSearchQuery } from './dto/game.dto';
import { GameService } from './game.service';
import { GameWithWishlist } from './interface/game.interface';
import { Game, GameDocument } from './schemas/game.schema';

@Controller('game')
export class GameController {
  constructor(
    private gameService: GameService,
    private wishlistService: WishlistService,
    private logger: PinoLogger,
  ) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(
    @Query() searchQuery: GameSearchQuery,
    @Req() req: IRequestWithProfile,
    @Res() res: Response,
  ) {
    const sendGames = async (games: Game[]) => {
      let respGames = games as GameWithWishlist[];
      if (req.user) {
        respGames = await this.wishlistService.populateWithWishlist(
          games,
          req.user,
        );
      }
      res.status(200).send(respGames);
    };
    const dbGames = await this.gameService.searchDatabase(
      searchQuery.name,
      req.user.platforms,
    );
    if (dbGames.length > 4) {
      this.logger.info('search returned from database');
      sendGames(dbGames.map((game: GameDocument) => game.toObject()));
      return;
    }
    await this.gameService.searchRepos(
      searchQuery.name,
      req.user.platforms,
      (repoGames, serviceName) => {
        this.logger.info(`search returned from service ${serviceName}`);
        sendGames(repoGames);
      },
    );
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async fetchGame(
    @Req() req: IRequestWithProfile,
    @Query() fetchGameQuery: FetchGameQuery,
  ) {
    console.log(req.user);
    return await this.gameService.fetchGame(req.user, fetchGameQuery);
  }
}
