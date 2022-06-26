import ICell from '@models/ICell';

export enum CustomizableInputAction {
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  MoveDown = 'MoveDown',
  RotateClockwise = 'RotateClockwise',
  RotateAnticlockwise = 'RotateAnticlockwise',
  Drop = 'Drop',
  Chat = 'Chat',
  Esc = 'Esc',
}

export enum HardCodedInputAction {
  MouseEvent = 'MouseEvent',
  PointerDrag = 'PointerDrag',
  KeyDown = 'KeyDown',
}

type InputAction = CustomizableInputAction | HardCodedInputAction;

export type MouseClickActionWithData = {
  type: HardCodedInputAction.MouseEvent;
  data: {
    cell: ICell | undefined;
    event: MouseEvent;
    button: number;
  };
};
export type PointerDragActionWithData = {
  type: HardCodedInputAction.PointerDrag;
  data: {
    dx: number;
    dy: number;
  };
};
export type KeyPressActionWithData = {
  type: HardCodedInputAction.KeyDown;
  data: KeyboardEvent;
};

export type RotateActionWithData = {
  type:
    | CustomizableInputAction.RotateClockwise
    | CustomizableInputAction.RotateAnticlockwise;
  data: { rotateDown: boolean };
};
export type InputActionWithData =
  | MouseClickActionWithData
  | PointerDragActionWithData
  | KeyPressActionWithData
  | RotateActionWithData
  | { type: InputAction };

export default InputAction;

export type InputActionListener = (action: InputActionWithData) => void;
