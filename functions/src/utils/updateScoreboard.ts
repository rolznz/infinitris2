import { IScoreboardEntry, IUser } from 'infinitris2-models';
import { getDb } from './firebase';

/**
 * Updates the public scoreboard
 */
export default function updateScoreboard() {
  return getDb()
    .collection('users')
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (userDoc) {
        const user = userDoc.data() as IUser;
        const scoreboardEntryRef = getDb().doc(
          `scoreboardEntries/${userDoc.id}`
        );
        if (!user.readOnly.nickname) {
          return;
        }
        const entry: IScoreboardEntry = {
          nickname: user.readOnly.nickname,
          coins: user.readOnly.coins,
          numCompletedChallenges: 0, // TODO: increment on completed new challenge
          networkImpact: user.readOnly.networkImpact,
          numBlocksPlaced: 0, // TODO: number of blocks placed
        };
        scoreboardEntryRef.set(entry);
      });
    });
}
