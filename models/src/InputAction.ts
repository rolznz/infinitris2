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
  MouseClick = 'MouseClick',
  KeyDown = 'KeyDown',
}

type InputAction = CustomizableInputAction | HardCodedInputAction;

export type MouseClickActionWithData = {
  type: HardCodedInputAction.MouseClick;
  data: {
    cell: ICell | undefined;
    event: MouseEvent;
    button: number;
  };
};
export type KeyPressActionWithData = {
  type: HardCodedInputAction.KeyDown;
  data: KeyboardEvent;
};
export type InputActionWithData =
  | MouseClickActionWithData
  | KeyPressActionWithData
  | { type: InputAction };

export default InputAction;

export type InputActionListener = (action: InputActionWithData) => void;
