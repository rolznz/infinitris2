import {
  IScoreboardEntry,
  IUser,
  getScoreboardEntryPath,
  getSettingPath,
  ScoreboardSettings,
  usersPath,
} from 'infinitris2-models';
import { getCurrentTimestamp, getDb } from './firebase';
import * as admin from 'firebase-admin';

/**
 * Updates the public scoreboard
 */
export default async function updateScoreboard() {
  // console.log('Updating scoreboard');
  const users = await getDb().collection(usersPath).get();

  const docs = users.docs
    .filter((entry) => !!(entry.data() as IUser).readOnly.nickname)
    .sort(
      (a, b) =>
        (b.data() as IUser).readOnly.networkImpact -
        (a.data() as IUser).readOnly.networkImpact
    );

  for (let i = 0; i < docs.length; i++) {
    await updateUserScoreboardEntry(docs[i], i + 1);
  }

  const settings: ScoreboardSettings = {
    lastUpdatedTimestamp: getCurrentTimestamp(),
  };

  await getDb().doc(getSettingPath('scoreboard')).set(settings);
}

function updateUserScoreboardEntry(
  userDoc: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>,
  placing: number
) {
  const user = userDoc.data() as IUser;
  const scoreboardEntryRef = getDb().doc(getScoreboardEntryPath(userDoc.id));
  const entry: IScoreboardEntry = {
    nickname: user.readOnly.nickname!,
    coins: user.readOnly.coins,
    characterId: user.selectedCharacterId || '0',
    numBadges: 0,
    networkImpact: user.readOnly.networkImpact,
    placing,
  };
  scoreboardEntryRef.set(entry);
}
