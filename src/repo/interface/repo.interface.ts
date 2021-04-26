import { Platform } from '../../game/interface/game.interface';

export interface RepoGameResponse {
  slug: string;
  name: string;
  artwork: string;
  platforms: Platform[];
  release: Date;
  description?: string;
  rating?: number;
}

export interface RepoProvider {
  init(): void;
  search(name: string, platforms: Platform[]): Promise<RepoGameResponse[]>;
}
