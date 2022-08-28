import useIngameStore from '@/state/IngameStore';
import { LeaderboardEntryLine } from '@/components/game/Leaderboard/LeaderboardEntryLine';
import shallow from 'zustand/shallow';

export function LeaderboardContents() {
  // this component should only re-render if the order of player ids (based on score) changes or a player joins/leaves
  const leaderboardPlayerIds = useIngameStore(
    (store) => store.leaderboardPlayerIds,
    shallow
  );
  // console.log('Re-render leaderboard contents');

  return (
    <>
      {leaderboardPlayerIds?.map((playerId) => (
        <LeaderboardEntryLine
          key={playerId}
          playerId={playerId}
          isLeaderboardOpen
        />
      ))}
    </>
  );
}
