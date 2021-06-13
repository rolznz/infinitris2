import { IScoreboardEntry, IUser } from 'infinitris2-models';
import { db } from './firebase';

/**
 * Updates the public scoreboard
 */
export default function updateScoreboard() {
  return db
    .collection('users')
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (userDoc) {
        const user = userDoc.data() as IUser;
        const scoreboardEntryRef = db.doc(`scoreboardEntries/${userDoc.id}`);
        const entry: IScoreboardEntry = {
          nickname: user.nickname,
          credits: user.credits,
          numCompletedChallenges: user.completedChallengeIds.length,
          networkImpact: user.networkImpact,
          numBlocksPlaced: 0, // TODO: number of blocks placed
        };
        scoreboardEntryRef.set(entry);
      });
    });
}
