import Routes from '@/models/Routes';

export function getChallengeTestUrl(): string {
  return `${Routes.challenges}/test`;
}
