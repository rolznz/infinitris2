export default interface IScoreboardEntry {
  nickname: string;
  credits: number;
  numCompletedChallenges: number;
  networkImpact: number;
  numBlocksPlaced: number;
  // TODO: createdTimestamp
}
