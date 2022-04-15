const cameraDrag = 0.25;
const cameraSpeed = 0.02;

export default class Camera {
  // FIXME: restructure to not require definite assignment
  private _x!: number;
  private _y!: number;
  private _vx!: number;
  private _vy!: number;
  private _dx!: number;
  private _dy!: number;
  private _followingId?: number;
  private _isDemo: boolean;
  constructor(isDemo = false) {
    this.reset();
    this._isDemo = isDemo;
  }

  get x(): number {
    return this._isDemo ? this._x : Math.round(this._x);
  }
  get y(): number {
    return this._isDemo ? this._y : Math.round(this._y);
  }

  bump(x: number, y: number) {
    this._dx += x;
    this._dy += y;
  }
  bumpPosition(x: number, y: number) {
    this._x += x;
    this._y += y;
    this._dx += x;
    this._dy += y;
  }

  reset() {
    console.log('Camera reset');
    this._followingId = undefined;
    this._x = 0;
    this._y = 0;
    this._vx = 0;
    this._vy = 0;
    this._dx = 0;
    this._dy = 0;
  }

  follow(x: number, y: number, id: number) {
    this._dx = -x;
    this._dy = -y;
    if (this._followingId != id) {
      this._x = this._dx;
      this._y = this._dy;
      this._followingId = id;
    }
  }

  update(delta: number) {
    this._vx *= 1 - Math.min(cameraDrag * delta, 1);
    this._vy *= 1 - Math.min(cameraDrag * delta, 1);

    this._vx += (this._dx - this._x) * cameraSpeed * delta;
    this._vy += (this._dy - this._y) * cameraSpeed * delta;
    this._x += this._vx * delta;
    this._y += this._vy * delta;
  }
}
