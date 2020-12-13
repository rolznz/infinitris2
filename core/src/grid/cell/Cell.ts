export default class Cell {
  private _row: number;
  private _column: number;
  private _opacity: number;
  constructor(column: number, row: number) {
    this._row = row;
    this._column = column;
    this._opacity = 0;
  }
  get row(): number {
    return this._row;
  }
  get column(): number {
    return this._column;
  }
  get opacity(): number {
    return this._opacity;
  }
  set opacity(opacity: number) {
    this._opacity = opacity;
  }
  get isEmpty(): boolean {
    return this._opacity < 1;
  }

  step() {}
}
