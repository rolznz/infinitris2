import ICell from '@models/ICell';
import { HardCodedInputAction } from '@models/InputAction';
import { ActionListener, ScreenPositionToCell } from './Input';

export default class MouseInput {
  private _fireAction: ActionListener;
  private _screenPositionToCell: ScreenPositionToCell;
  private _mouseButtonDown: number | undefined;
  private _currentCell: ICell | undefined;

  constructor(
    fireAction: ActionListener,
    screenPositionToCell: ScreenPositionToCell
  ) {
    this._mouseButtonDown = undefined;
    this._fireAction = fireAction;
    this._screenPositionToCell = screenPositionToCell;
    // FIXME: use canvas instead of document
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('contextmenu', this._disableContextMenu);
  }
  destroy() {
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('contextmenu', this._disableContextMenu);
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
