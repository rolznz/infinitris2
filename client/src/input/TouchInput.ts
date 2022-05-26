import {
  CustomizableInputAction,
  InputActionListener,
} from '@models/InputAction';

const TIME_THRESHOLD = 300;
const NUM_DIVISIONS = 20;

export default class TouchInput {
  private _fireAction: InputActionListener;
  private _pointerX: number;
  private _pointerY: number;
  private _pointerStartTime: number;
  private _pointerStartX: number;
  private _pointerStartY: number;
  private _lastActionX: number;
  private _lastActionY: number;
  private _movementThreshold: number;
  private _rotateThreshold: number;
  private _hasMoved: boolean;
  private _hasMovedHorizontally: boolean;

  constructor(fireAction: InputActionListener) {
    this._fireAction = fireAction;
    this._pointerX = 0;
    this._pointerY = 0;
    this._pointerStartX = 0;
    this._pointerStartY = 0;
    this._lastActionX = 0;
    this._lastActionY = 0;
    this._movementThreshold = 0;
    this._rotateThreshold = 0;
    this._pointerStartTime = 0;
    this._hasMoved = false;
    this._hasMovedHorizontally = false;
    // FIXME: use canvas instead of document
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
    this._hasMovedHorizontally = false;
    this._pointerStartTime = Date.now();
    this._movementThreshold =
      Math.min(window.innerWidth, window.innerHeight) / NUM_DIVISIONS;
    this._rotateThreshold = Math.max(this._movementThreshold * 0.5, 1);

    this._pointerX =
      this._lastActionX =
      this._pointerStartX =
        event.touches[0].clientX;
    this._pointerY =
      this._lastActionY =
      this._pointerStartY =
        event.touches[0].clientY;
  };

  private _onTouchEnd = (event: TouchEvent) => {
    const touchTime = Date.now() - this._pointerStartTime;
    if (touchTime > TIME_THRESHOLD || this._hasMovedHorizontally) {
      return;
    }

    const totalPointerChangeX = this._pointerX - this._pointerStartX;
    const totalPointerChangeY = this._pointerY - this._pointerStartY;
    const pointerChangeDistance = Math.sqrt(
      totalPointerChangeX * totalPointerChangeX +
        totalPointerChangeY * totalPointerChangeY
    );

    if (pointerChangeDistance < this._rotateThreshold) {
      if (this._pointerX < document.body.clientWidth * 0.5) {
        this._fireAction({
          type: CustomizableInputAction.RotateAnticlockwise,
        });
      } else {
        this._fireAction({ type: CustomizableInputAction.RotateClockwise });
      }
    } else if (totalPointerChangeY < -this._movementThreshold) {
      this._fireAction({ type: CustomizableInputAction.Drop });
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
          this._hasMovedHorizontally = true;
          this._fireAction({ type: CustomizableInputAction.MoveRight });
        } else if (pointerChangeX < -this._movementThreshold) {
          this._lastActionX -= this._movementThreshold;
          this._lastActionY = this._pointerY;
          this._hasMoved = true;
          this._hasMovedHorizontally = true;
          this._fireAction({ type: CustomizableInputAction.MoveLeft });
        }
      } else {
        if (pointerChangeY > this._movementThreshold) {
          this._lastActionX = this._pointerX;
          this._lastActionY += this._movementThreshold;
          this._hasMoved = true;
          this._fireAction({ type: CustomizableInputAction.MoveDown });
        }
      }
      break;
    }
  };
}
