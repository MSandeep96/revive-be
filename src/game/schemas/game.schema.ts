import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Platform } from '../interface/game.interface';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop()
  artwork: string;
  @Prop()
  slug: string;
  @Prop()
  name: string;
  @Prop()
  platform: Platform;
  @Prop({ type: Date })
  release: Date;
  @Prop()
  description?: string;
  @Prop()
  rating?: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
GameSchema.index({ slug: 1, platform: 1 }, { unique: true });
GameSchema.index({ name: 'text', description: 'text' });
