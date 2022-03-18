import useIngameStore, { LeaderboardEntry } from '@/state/IngameStore';
import { hexToString, ISimulationEventListener } from 'infinitris2-models';
import { debounce } from 'ts-debounce';

function _updateLeaderboard() {
  console.log('Updating leaderboard');
  const simulation = useIngameStore.getState().simulation;
  const maxEntries = 5; // TODO: responsive

  const leaderboardEntries: LeaderboardEntry[] =
    simulation?.players.map((player, i) => ({
      isHuman: i === 0,
      placing: 0,
      playerId: player.id,
      nickname: player.nickname,
      color: hexToString(player.color),
      characterId: player.characterId,
      score: player.score,
      isSpectating: player.isSpectating,
    })) || [];

  leaderboardEntries.sort((a, b) => b.score - a.score);
  for (let i = 0; i < leaderboardEntries.length; i++) {
    leaderboardEntries[i].placing = i + 1;
  }

  const followingPlayer = simulation?.followingPlayer;
  if (followingPlayer && followingPlayer.isHuman) {
    const playerScoreIndex = leaderboardEntries.findIndex(
      (score) => score.playerId === followingPlayer.id
    );
    if (playerScoreIndex > maxEntries - 1) {
      // 10 > 9
      // start at 9,
      // (10 - 9)
      // 11 > 9
      // 11 - 9 = 2
      leaderboardEntries.splice(
        maxEntries - 1,
        playerScoreIndex - (maxEntries - 1)
      );
    }
  }
  leaderboardEntries.splice(maxEntries);

  useIngameStore.getState().setLeaderboardEntries(leaderboardEntries);
}

const updateLeaderboard = debounce(_updateLeaderboard, 500) as () => void;

export const leaderboardListener: Partial<ISimulationEventListener> = {
  onPlayerCreated: updateLeaderboard,
  onPlayerDestroyed: updateLeaderboard,
  onPlayerScoreChanged: updateLeaderboard,
  onSimulationNextRound: updateLeaderboard,
  onPlayerToggleSpectating: updateLeaderboard,
};