import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import {
  getScoreboardEntryPath,
  getSettingPath,
  IScoreboardEntry,
  ScoreboardSettings,
} from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import updateScoreboard from '../schedules/updateScoreboard';
import { getCurrentTimestamp } from '../utils/firebase';

describe('Update Scoreboard', () => {
  afterEach(async () => {
    await teardown();
  });

  test('user scoreboard entry is created', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
      },
      false
    );

    await updateScoreboard();
    const scoreboardEntry1 = (
      await db.doc(getScoreboardEntryPath(dummyData.userId1)).get()
    ).data() as IScoreboardEntry;

    expect(scoreboardEntry1.coins).toEqual(
      dummyData.existingUser.readOnly.coins
    );
    expect(scoreboardEntry1.networkImpact).toEqual(
      dummyData.existingUser.readOnly.networkImpact
    );

    const scoreboardSettings = (
      await db.doc(getSettingPath('scoreboard')).get()
    ).data() as ScoreboardSettings;
    expect(scoreboardSettings.lastUpdatedTimestamp.seconds).toBeGreaterThan(
      getCurrentTimestamp().seconds - 5
    );
  });
});
