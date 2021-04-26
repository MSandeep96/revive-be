import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { IGDBService } from './repoProviders/igdb.service';
import { RawgService } from './repoProviders/rawg.service';

@Module({
  providers: [RawgService, IGDBService, RepoService],
  exports: [RepoService],
})
export class RepoModule {}
