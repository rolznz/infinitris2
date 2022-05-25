import ICell from '@models/ICell';
import { HardCodedInputAction, InputActionListener } from '@models/InputAction';
import { ScreenPositionToCell } from './Input';

export default class MouseInput {
  private _fireAction: InputActionListener;
  private _screenPositionToCell: ScreenPositionToCell;
  private _mouseButtonIndex: number | undefined;
  private _currentCell: ICell | undefined;
  private _lastPointerEvent: PointerEvent | undefined;
  private _pointerDragDistance: number;
  private _isMouseDown: boolean;

  constructor(
    fireAction: InputActionListener,
    screenPositionToCell: ScreenPositionToCell
  ) {
    this._mouseButtonIndex = undefined;
    this._isMouseDown = false;
    this._pointerDragDistance = 0;
    this._fireAction = fireAction;
    this._screenPositionToCell = screenPositionToCell;
    this._getCanvas().addEventListener('mousedown', this._onMouseDown);
    this._getCanvas().addEventListener('mousemove', this._onMouseMove);
    this._getCanvas().addEventListener('mouseup', this._onMouseUp);
    this._getCanvas().addEventListener('pointerdown', this._onPointerDown);
    this._getCanvas().addEventListener('pointermove', this._onPointerMove);
    this._getCanvas().addEventListener('pointerup', this._onPointerUp);
    this._getCanvas().addEventListener('contextmenu', this._disableContextMenu);
  }
  destroy() {
    this._getCanvas()?.removeEventListener('mousedown', this._onMouseDown);
    this._getCanvas()?.removeEventListener('mousemove', this._onMouseMove);
    this._getCanvas()?.removeEventListener('mouseup', this._onMouseUp);
    this._getCanvas()?.removeEventListener('pointerdown', this._onPointerDown);
    this._getCanvas()?.removeEventListener('pointermove', this._onPointerMove);
    this._getCanvas()?.removeEventListener('pointerup', this._onPointerUp);
    this._getCanvas()?.removeEventListener(
      'contextmenu',
      this._disableContextMenu
    );
  }

  // TODO: pass in or make this a utility function
  private _getCanvas() {
    return document.getElementsByTagName('canvas')[0];
  }
  private _disableContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  private _onMouseMove = (event: MouseEvent) => {
    if (this._mouseButtonIndex !== undefined) {
      const currentCell = this._screenPositionToCell(event.x, event.y);
      if (currentCell !== this._currentCell) {
        this._fireAction({
          type: HardCodedInputAction.MouseEvent,
          data: {
            cell: currentCell,
            event,
            button: this._mouseButtonIndex,
          },
        });
        this._currentCell = currentCell;
      }
    }
  };

  private _onMouseDown = (event: MouseEvent) => {
    this._isMouseDown = true;
    this._currentCell = this._screenPositionToCell(event.x, event.y);
    this._mouseButtonIndex = event.button;
    this._fireAction({
      type: HardCodedInputAction.MouseEvent,
      data: {
        cell: this._currentCell,
        event,
        button: this._mouseButtonIndex,
      },
    });
  };

  private _onMouseUp = (event: MouseEvent) => {
    this._mouseButtonIndex = undefined;
    this._isMouseDown = false;
  };

  private _onPointerMove = (event: PointerEvent) => {
    if (
      !this._isMouseDown &&
      this._mouseButtonIndex !== undefined &&
      this._lastPointerEvent
    ) {
      this._pointerDragDistance += Math.sqrt(
        Math.pow(event.x - this._lastPointerEvent.x, 2) +
          Math.pow(event.y - this._lastPointerEvent.y, 2)
      );
      this._fireAction({
        type: HardCodedInputAction.PointerDrag,
        data: {
          dx: event.x - this._lastPointerEvent.x,
          dy: event.y - this._lastPointerEvent.y,
        },
      });
    }
    this._lastPointerEvent = event;
  };

  private _onPointerDown = (event: PointerEvent) => {
    this._currentCell = this._screenPositionToCell(event.x, event.y);
    this._mouseButtonIndex = event.button;
    this._lastPointerEvent = event;
    this._pointerDragDistance = 0;
  };

  private _onPointerUp = (event: PointerEvent) => {
    if (
      this._mouseButtonIndex !== undefined &&
      this._pointerDragDistance < 10
    ) {
      const currentCell = this._screenPositionToCell(event.x, event.y);
      if (currentCell === this._currentCell) {
        this._fireAction({
          type: HardCodedInputAction.MouseEvent,
          data: {
            cell: currentCell,
            event,
            button: this._mouseButtonIndex,
          },
        });
        this._currentCell = currentCell;
      }
    }
    this._mouseButtonIndex = undefined;
  };
}
