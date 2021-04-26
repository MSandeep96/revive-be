import { BadRequestException } from '@nestjs/common';
import { Platform } from '../interface/game.interface';
import { ParsePlatform } from './parse-platform.pipe';

describe('ParseIntPipe', () => {
  let pipe: ParsePlatform;

  beforeEach(() => {
    pipe = new ParsePlatform();
  });
  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('successful calls', () => {
    it('should return enum values', () => {
      const valid = ['ps4', 'xbox_1', 'xbox_1,ps5', 'xbox_x,xbox_1,ps4,ps5'];
      const expected = [
        [Platform.PS4],
        [Platform.XBOX_1],
        [Platform.XBOX_1, Platform.PS5],
        [Platform.XBOX_X, Platform.XBOX_1, Platform.PS4, Platform.PS5],
      ];
      valid.forEach((val, i) => {
        expect(pipe.transform(val)).toEqual(expected[i]);
      });
    });

    it('should remove duplicates', () => {
      const valid = ['ps4,ps4,ps5', 'xbox_1,xbox_1', 'xbox_1,ps5,ps5,ps5'];
      const expected = [
        [Platform.PS4, Platform.PS5],
        [Platform.XBOX_1],
        [Platform.XBOX_1, Platform.PS5],
      ];
      valid.forEach((val, i) => {
        expect(pipe.transform(val)).toEqual(expected[i]);
      });
    });
  });
  describe('unsuccessful calls', () => {
    it('should throw an error if invalid platform', () => {
      const invalid = [
        'ps4,ps6,ps5',
        'xbox_one,xbox_1',
        'xbox_1,playstation4,ps5',
      ];
      invalid.forEach((inval) => {
        expect(() => pipe.transform(inval)).toThrowError(BadRequestException);
      });
    });
  });
});
