import { IProduct } from './IProduct';

export interface ICharacter extends IProduct {
  // id: number;
  color: string;
  name: string;
  patternFilename: string;
  thumbnail: string;
}

export type FallbackCharacter = {
  id: '0';
  color: string;
  name: string;
  patternFilename?: undefined;
};
