const cameraDrag = 0.25;
const cameraSpeed = 0.01;
export default class Camera {
  x: number;
  y: number;
  private _vx: number;
  private _vy: number;
  private _dx: number;
  private _dy: number;
  private _followingId: number;
  private _gridWidth: number;
  constructor() {
    this.reset();
  }

  set gridWidth(gridWidth: number) {
    this._gridWidth = gridWidth;
  }

  reset() {
    this._followingId = null;
    this.x = 0;
    this.y = 0;
    this._vx = 0;
    this._vy = 0;
    this._dx = 0;
    this._dy = 0;
  }

  follow(x: number, y: number, id: number) {
    this._dx = -x;
    this._dy = -y;
    if (this._followingId != id) {
      this.x = this._dx;
      this.y = this._dy;
      this._followingId = id;
    }
  }

  update() {
    this._vx *= 1 - cameraDrag;
    this._vy *= 1 - cameraDrag;

    let ax = this._dx - this.x;
    if (ax > this._gridWidth / 2) {
      ax -= this._gridWidth;
    } else if (ax < -this._gridWidth / 2) {
      ax += this._gridWidth;
    }

    this._vx += ax * cameraSpeed;
    this._vy += (this._dy - this.y) * cameraSpeed;
    this.x += this._vx;
    if (this.x <= -this._gridWidth) {
      this.x += this._gridWidth;
    } else if (this.x > 0) {
      this.x -= this._gridWidth;
    }
    this.y += this._vy;
  }
}
