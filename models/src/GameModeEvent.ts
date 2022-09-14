type SyncedGameModeEvent = { isSynced: true };

export type GameModeTeamEvent = {
  type: 'teamChanged';
  playerId: number;
  teamNumber: number;
} & SyncedGameModeEvent;

export type ColumnConquestEvent = {
  type: 'columnChanged';
  column: number;
}; // | SecondEvent

export type ConquestEvent =
  | {
      type: 'cellCaptured';
      row: number;
      column: number;
      color: number;
    }
  | ({
      type: 'cellsCaptured';
      playerId: number;
      cells: {
        row: number;
        column: number;
      }[];
    } & SyncedGameModeEvent);

export type GameModeEvent = (
  | ColumnConquestEvent
  | ConquestEvent
  | GameModeTeamEvent
) & {
  isSynced?: boolean;
};
