import CellType from '@models/CellType';
import ChallengeCellType from '@models/ChallengeCellType';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { CustomizableInputAction } from '@models/InputAction';

export default class GestureBehaviour implements ICellBehaviour {
  private _inputAction: CustomizableInputAction[];
  constructor(...inputAction: CustomizableInputAction[]) {
    this._inputAction = inputAction;
  }

  clone(_cell: ICell): ICellBehaviour {
    return new GestureBehaviour(...this._inputAction);
  }

  get inputAction(): CustomizableInputAction[] {
    return this._inputAction;
  }

  get isPassable(): boolean {
    return true;
  }

  get isReplaceable(): boolean {
    return false;
  }

  get type(): CellType {
    return CellType.Gesture;
  }

  get alpha(): number {
    return 1;
  }

  toChallengeCellType(): ChallengeCellType {
    switch (this._inputAction[0]) {
      case CustomizableInputAction.MoveLeft:
        return ChallengeCellType.GestureMoveLeft;
      case CustomizableInputAction.MoveRight:
        return ChallengeCellType.GestureMoveRight;
      case CustomizableInputAction.MoveDown:
        return ChallengeCellType.GestureMoveDown;
      case CustomizableInputAction.RotateClockwise:
        return this._inputAction.length === 1
          ? ChallengeCellType.GestureRotateClockwise
          : ChallengeCellType.GestureRotateDownClockwise;
      case CustomizableInputAction.RotateAnticlockwise:
        return this._inputAction.length === 1
          ? ChallengeCellType.GestureRotateAnticlockwise
          : ChallengeCellType.GestureRotateDownAnticlockwise;
      case CustomizableInputAction.Drop:
        return ChallengeCellType.GestureDrop;
      default:
        throw new Error('Unsupported input action: ' + this._inputAction);
    }
  }
  getImageFilename(): string {
    const prefix = 'gesture_';
    const rotateDownPrefix = this._inputAction.length > 1 ? '_down' : '';
    switch (this._inputAction[0]) {
      case CustomizableInputAction.MoveLeft:
        return prefix + 'left';
      case CustomizableInputAction.MoveRight:
        return prefix + 'right';
      case CustomizableInputAction.MoveDown:
        return prefix + 'down';
      case CustomizableInputAction.RotateClockwise:
        return prefix + `rotate${rotateDownPrefix}_clockwise`;
      case CustomizableInputAction.RotateAnticlockwise:
        return prefix + `rotate${rotateDownPrefix}_anticlockwise`;
      case CustomizableInputAction.Drop:
        return prefix + 'drop';
      default:
        throw new Error('Unsupported input action: ' + this._inputAction);
    }
  }
}
