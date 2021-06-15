import { Game } from '../schemas/game.schema';

export enum Platform {
  XBOX_X = 'xbox_x',
  XBOX_1 = 'xbox_1',
  PS4 = 'ps4',
  PS5 = 'ps5',
}

export type GameWithWishlist = Game & {
  wishlist: boolean;
};

export type OnRepoFirstReturnFn = (repoGames: Game[], name: string) => void;
