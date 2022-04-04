import useIngameStore, { LeaderboardEntry } from '@/state/IngameStore';
import {
  hexToString,
  ISimulationEventListener,
  PlayerStatus,
} from 'infinitris2-models';
import { debounce } from 'ts-debounce';

function _updateLeaderboard() {
  console.log('Updating leaderboard');
  const simulation = useIngameStore.getState().simulation;
  const maxEntries = 5; // TODO: responsive

  const leaderboardEntries: LeaderboardEntry[] =
    simulation?.players.map((player, i) => ({
      isControllable: player.isControllable,
      placing: 0,
      playerId: player.id,
      isBot: player.isBot,
      nickname: player.nickname,
      color: hexToString(player.color),
      characterId: player.characterId,
      score: player.score,
      status: player.status,
    })) || [];

  leaderboardEntries.sort((a, b) => {
    if (a.status === PlayerStatus.ingame && b.status === PlayerStatus.ingame) {
      return b.score - a.score;
    } else if (a.status === PlayerStatus.ingame) {
      return -1;
    } else if (b.status === PlayerStatus.ingame) {
      return 1;
    } else {
      return (
        simulation!.getPlayer(b.playerId).lastStatusChangeTime -
        simulation!.getPlayer(a.playerId).lastStatusChangeTime
      );
    }
  });
  for (let i = 0; i < leaderboardEntries.length; i++) {
    leaderboardEntries[i].placing = i + 1;
  }

  const followingPlayer = simulation?.followingPlayer;
  if (followingPlayer && followingPlayer.isControllable) {
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
  useIngameStore
    .getState()
    .setNumNonSpectatorPlayers(simulation?.nonSpectatorPlayers.length || 0);
}

const updateLeaderboard = debounce(_updateLeaderboard, 500) as () => void;

export const leaderboardListener: Partial<ISimulationEventListener> = {
  onPlayerCreated: updateLeaderboard,
  onPlayerDestroyed: updateLeaderboard,
  onPlayerScoreChanged: updateLeaderboard,
  onNextRound: updateLeaderboard,
  onEndRound: updateLeaderboard,
  onPlayerChangeStatus: updateLeaderboard,
};
