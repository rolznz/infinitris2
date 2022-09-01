export type ColumnConquestEvent = {
  type: 'columnChanged';
  column: number;
}; // | SecondEvent

export type ConquestEvent = {
  type: 'cellAreaCapture';
  row: number;
  column: number;
  color: number;
}; // | SecondEvent

export type GameModeEvent = ColumnConquestEvent | ConquestEvent;
