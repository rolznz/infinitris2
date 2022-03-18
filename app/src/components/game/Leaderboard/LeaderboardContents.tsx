import useIngameStore from '@/state/IngameStore';
import { LeaderboardEntryLine } from '@/components/game/Leaderboard/LeaderboardEntryLine';

export function LeaderboardContents() {
  const leaderboardEntries = useIngameStore(
    (store) => store.leaderboardEntries
  );
  console.log('Re-render leaderboard contents');

  return (
    <>
      {leaderboardEntries?.map((entry) => (
        <LeaderboardEntryLine
          key={entry.playerId}
          entry={entry}
          isLeaderboardOpen
        />
      ))}
    </>
  );
}
