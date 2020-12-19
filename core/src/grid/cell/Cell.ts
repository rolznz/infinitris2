import CellType from './CellType';

export default class Cell {
  private _row: number;
  private _column: number;
  private _type: CellType;
  constructor(column: number, row: number) {
    this._row = row;
    this._column = column;
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get type(): CellType {
    return this._type;
  }
  set type(type: CellType) {
    this._type = type;
  }
  get isEmpty(): boolean {
    return this._type !== CellType.Full;
  }

  step() {}
}
