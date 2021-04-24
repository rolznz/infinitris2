import { InputAction } from 'models';
import { ActionListener } from './Input';

const TIME_THRESHOLD = 300;
const NUM_DIVISIONS = 20;

export default class TouchInput {
  private _fireAction: ActionListener;
  private _pointerX: number;
  private _pointerY: number;
  private _pointerStartTime: number;
  private _pointerStartX: number;
  private _pointerStartY: number;
  private _lastActionX: number;
  private _lastActionY: number;
  private _movementThreshold: number;
  private _hasMoved: boolean;

  constructor(fireAction: ActionListener) {
    this._fireAction = fireAction;
    this._pointerX = 0;
    this._pointerY = 0;
    this._pointerStartX = 0;
    this._pointerStartY = 0;
    this._lastActionX = 0;
    this._lastActionY = 0;
    this._movementThreshold = 0;
    this._pointerStartTime = 0;
    this._hasMoved = false;
    document.addEventListener('touchstart', this._onTouchStart);
    document.addEventListener('touchend', this._onTouchEnd);
    document.addEventListener('touchmove', this._onTouchMove);
  }

  destroy() {
    document.removeEventListener('touchstart', this._onTouchStart);
    document.removeEventListener('touchend', this._onTouchEnd);
    document.removeEventListener('touchmove', this._onTouchMove);
  }

  private _onTouchStart = (event: TouchEvent) => {
    this._hasMoved = false;
    this._pointerStartTime = Date.now();
    this._movementThreshold =
      Math.min(window.innerWidth, window.innerHeight) / NUM_DIVISIONS;

    this._pointerX = this._lastActionX = this._pointerStartX =
      event.touches[0].clientX;
    this._pointerY = this._lastActionY = this._pointerStartY =
      event.touches[0].clientY;
  };

  private _onTouchEnd = () => {
    const touchTime = Date.now() - this._pointerStartTime;
    if (touchTime > TIME_THRESHOLD || this._hasMoved) {
      return;
    }

    const totalPointerChangeX = this._pointerX - this._pointerStartX;
    const totalPointerChangeY = this._pointerY - this._pointerStartY;
    const pointerChangeDistance = Math.sqrt(
      totalPointerChangeX * totalPointerChangeX +
        totalPointerChangeY * totalPointerChangeY
    );

    if (pointerChangeDistance < this._movementThreshold) {
      if (this._pointerX < document.body.clientWidth * 0.5) {
        this._fireAction(InputAction.RotateAnticlockwise);
      } else {
        this._fireAction(InputAction.RotateClockwise);
      }
    } else if (totalPointerChangeY < -this._movementThreshold) {
      this._fireAction(InputAction.Drop);
    }
  };

  private _onTouchMove = (event: TouchEvent) => {
    // disable iphone scrolling and "bounces"
    event.preventDefault();
    this._pointerX = event.touches[0].clientX;
    this._pointerY = event.touches[0].clientY;

    while (true) {
      const pointerChangeX = this._pointerX - this._lastActionX;
      const pointerChangeY = this._pointerY - this._lastActionY;
      if (Math.abs(pointerChangeX) > Math.abs(pointerChangeY)) {
        if (pointerChangeX > this._movementThreshold) {
          this._lastActionX += this._movementThreshold;
          this._lastActionY = this._pointerY;
          this._hasMoved = true;
          this._fireAction(InputAction.MoveRight);
        } else if (pointerChangeX < -this._movementThreshold) {
          this._lastActionX -= this._movementThreshold;
          this._lastActionY = this._pointerY;
          this._hasMoved = true;
          this._fireAction(InputAction.MoveLeft);
        }
      } else {
        if (pointerChangeY > this._movementThreshold) {
          this._lastActionX = this._pointerX;
          this._lastActionY += this._movementThreshold;
          this._hasMoved = true;
          this._fireAction(InputAction.MoveDown);
        }
      }
      break;
    }
  };
}
