export class FpsCounter {
  private _nextFps: number;
  private _lastFpsCheck: number;
  private _fps: number;
  constructor() {
    this._nextFps = 0;
    this._lastFpsCheck = 0;
    this._fps = 0;
  }

  get fps(): number {
    return this._fps;
  }

  step() {
    const time = Date.now();
    if (time - this._lastFpsCheck < 1000) {
      ++this._nextFps;
    } else {
      this._lastFpsCheck = time;
      this._fps = this._nextFps;
      this._nextFps = 0;
    }
  }
}
