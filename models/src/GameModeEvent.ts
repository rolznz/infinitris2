export type ColumnConquestEvent = {
  type: 'columnChanged';
  column: number;
}; // | SecondEvent

export type GameModeEvent = ColumnConquestEvent; // | SecondGameModeTypeEvent
