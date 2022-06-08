import { ICharacter } from '@models/ICharacter';
import { charactersPath } from '@models/util/fireStorePaths';
import { apiUrl } from '@src/Server';
import got from 'got';

export async function getCharacters(): Promise<ICharacter[] | undefined> {
  if (!apiUrl) {
    console.log('No API_URL set, no characters retrieved');
    return;
  }
  try {
    return await got
      .get(`${apiUrl}/public/${charactersPath}`)
      .json<ICharacter[]>();
  } catch (error) {
    console.error('Failed to retrieve characters', error);
  }
}
