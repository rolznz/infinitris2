export default interface IScoreboardEntry {
  nickname: string;
  credits: number;
  numCompletedChallenges: number;
  networkImpact: number;
  numBlocksPlaced: number;
  // TODO: creator rating
  // TODO: createdTimestamp
  // TODO: number of conversions (affiliate program)
}
