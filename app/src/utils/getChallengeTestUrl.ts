import Routes from '@/models/Routes';
import stableStringify from '@/utils/stableStringify';
import { IChallenge } from 'infinitris2-models';

export function getChallengeTestUrl(challenge: IChallenge): string {
  return `${Routes.challenges}/test?json=${encodeURIComponent(
    stableStringify(challenge)
  )}`;
}
