import ICell from '@models/ICell';
import { HardCodedInputAction, InputActionListener } from '@models/InputAction';
import { ScreenPositionToCell } from './Input';

export default class MouseInput {
  private _fireAction: InputActionListener;
  private _screenPositionToCell: ScreenPositionToCell;
  private _mouseButtonDown: number | undefined;
  private _currentCell: ICell | undefined;

  constructor(
    fireAction: InputActionListener,
    screenPositionToCell: ScreenPositionToCell
  ) {
    this._mouseButtonDown = undefined;
    this._fireAction = fireAction;
    this._screenPositionToCell = screenPositionToCell;
    this._getCanvas().addEventListener('mousedown', this._onMouseDown);
    this._getCanvas().addEventListener('mousemove', this._onMouseMove);
    this._getCanvas().addEventListener('mouseup', this._onMouseUp);
    this._getCanvas().addEventListener('pointerdown', this._onMouseDown);
    this._getCanvas().addEventListener('pointermove', this._onMouseMove);
    this._getCanvas().addEventListener('pointerup', this._onMouseUp);
    this._getCanvas().addEventListener('contextmenu', this._disableContextMenu);
  }
  destroy() {
    this._getCanvas()?.removeEventListener('mousedown', this._onMouseDown);
    this._getCanvas()?.removeEventListener('mousemove', this._onMouseMove);
    this._getCanvas()?.removeEventListener('mouseup', this._onMouseUp);
    this._getCanvas()?.removeEventListener('pointerdown', this._onMouseDown);
    this._getCanvas()?.removeEventListener('pointermove', this._onMouseMove);
    this._getCanvas()?.removeEventListener('pointerup', this._onMouseUp);
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
    if (this._mouseButtonDown !== undefined) {
      const currentCell = this._screenPositionToCell(event.x, event.y);
      if (currentCell !== this._currentCell) {
        this._fireAction({
          type: HardCodedInputAction.MouseClick,
          data: {
            cell: currentCell,
            event,
            button: this._mouseButtonDown,
          },
        });
        this._currentCell = currentCell;
      }
    }
  };

  private _onMouseDown = (event: MouseEvent) => {
    this._currentCell = this._screenPositionToCell(event.x, event.y);
    this._mouseButtonDown = event.button;
    this._fireAction({
      type: HardCodedInputAction.MouseClick,
      data: {
        cell: this._currentCell,
        event,
        button: this._mouseButtonDown,
      },
    });
  };

  private _onMouseUp = (event: MouseEvent) => {
    this._mouseButtonDown = undefined;
  };
}
