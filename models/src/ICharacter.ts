import { IProduct } from './IProduct';

export interface ICharacter extends IProduct {
  color: string;
  name: string;
  patternFilename: string;
  thumbnail: string;
}
