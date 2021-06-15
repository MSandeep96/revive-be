import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RepoModule } from '../repo/repo.module';
import { WishlistModule } from '../wishlist/wishlist.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game, GameSchema } from './schemas/game.schema';

@Module({
  imports: [
    RepoModule,
    WishlistModule,
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
