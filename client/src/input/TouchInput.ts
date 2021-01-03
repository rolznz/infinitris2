import { InputAction } from 'models';
import { ActionListener } from './Input';

const MOVEMENT_THRESHOLD = 10;
export default class TouchInput {
  private _fireAction: ActionListener;
  private _pointerX: number;
  private _pointerY: number;
  private _pointerStartX: number;
  private _pointerStartY: number;
  private _lastActionX: number;
  private _lastActionY: number;

  constructor(fireAction: ActionListener) {
    this._fireAction = fireAction;
    this._pointerX = 0;
    this._pointerY = 0;
    this._pointerStartX = 0;
    this._pointerStartY = 0;
    this._lastActionX = 0;
    this._lastActionY = 0;
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
    this._pointerX = this._lastActionX = this._pointerStartX =
      event.touches[0].clientX;
    this._pointerY = this._lastActionY = this._pointerStartY =
      event.touches[0].clientY;
  };

  private _onTouchEnd = () => {
    const pointerChangeX = this._pointerX - this._pointerStartX;
    const pointerChangeY = this._pointerY - this._pointerStartY;
    const pointerChangeDistance = Math.sqrt(
      pointerChangeX * pointerChangeX + pointerChangeY * pointerChangeY
    );

    if (pointerChangeDistance < MOVEMENT_THRESHOLD) {
      if (this._pointerX < document.body.clientWidth * 0.5) {
        this._fireAction(InputAction.RotateAntiClockwise);
      } else {
        this._fireAction(InputAction.RotateClockwise);
      }
    }

    this._fireAction(InputAction.MoveLeft);
  };

  private _onTouchMove = (event: TouchEvent) => {
    // disable iphone scrolling and "bounces"
    event.preventDefault();
    this._pointerX = event.touches[0].clientX;
    this._pointerY = event.touches[0].clientY;

    while (true) {
      const pointerChangeX = this._pointerX - this._lastActionX;
      const pointerChangeY = this._pointerY - this._lastActionY;
      let continueMoving = false;
      if (pointerChangeX > MOVEMENT_THRESHOLD) {
        this._lastActionX += MOVEMENT_THRESHOLD;
        this._fireAction(InputAction.MoveRight);
        continueMoving = true;
      } else if (pointerChangeX < -MOVEMENT_THRESHOLD) {
        this._lastActionX -= MOVEMENT_THRESHOLD;
        this._fireAction(InputAction.MoveLeft);
        continueMoving = true;
      }
      if (pointerChangeY > MOVEMENT_THRESHOLD) {
        this._lastActionY += MOVEMENT_THRESHOLD;
        this._fireAction(InputAction.MoveDown);
        continueMoving = true;
      } else if (pointerChangeY < -MOVEMENT_THRESHOLD) {
        this._fireAction(InputAction.Drop);
      }
      break;
    }
  };
}
