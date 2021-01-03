const cameraDrag = 0.25;
const cameraSpeed = 0.01;
export default class Camera {
  // FIXME: restructure to not require definite assignment
  private _x!: number;
  private _y!: number;
  private _vx!: number;
  private _vy!: number;
  private _dx!: number;
  private _dy!: number;
  private _followingId?: number;
  private _gridWidth!: number;
  private _wrapIndex: number;
  constructor() {
    this.reset();
    this._wrapIndex = 0;
  }

  get wrappedX(): number {
    const wrappedX =
      ((this._x % this._gridWidth) - this._gridWidth) % this._gridWidth;

    return wrappedX;
  }
  get y(): number {
    return this._y;
  }

  set gridWidth(gridWidth: number) {
    this._gridWidth = gridWidth;
  }

  moveWrapIndex(wrapIndexChange: number) {
    this._wrapIndex += wrapIndexChange;
  }

  reset() {
    this._followingId = undefined;
    this._x = 0;
    this._y = 0;
    this._vx = 0;
    this._vy = 0;
    this._dx = 0;
    this._dy = 0;
  }

  follow(x: number, y: number, id: number) {
    this._dx = -(x + this._wrapIndex * this._gridWidth);
    this._dy = -y;
    if (this._followingId != id) {
      this._x = this._dx;
      this._y = this._dy;
      this._followingId = id;
    }
  }

  update() {
    this._vx *= 1 - cameraDrag;
    this._vy *= 1 - cameraDrag;

    /*let ax = this._dx - this._x;
    if (ax > this._gridWidth / 2) {
      ax -= this._gridWidth;
    } else if (ax < -this._gridWidth / 2) {
      ax += this._gridWidth;
    }*/

    const ax = this._dx - this._x;

    this._vx += ax * cameraSpeed;
    this._vy += (this._dy - this._y) * cameraSpeed;
    this._x += this._vx;
    /*(((this._x + this._vx) % this.gridWidth) + this.gridWidth) %
      this.gridWidth;*/
    this._y += this._vy;
  }
}
