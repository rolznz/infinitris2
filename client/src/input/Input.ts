import ControllablePlayer from '../ControllablePlayer';
import Grid from '@core/grid/Grid';
import Simulation from '@core/Simulation';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';
import KeyboardInput from './KeyboardInput';
import TouchInput from './TouchInput';
import ControlSettings, {
  DEFAULT_KEYBOARD_CONTROLS,
} from '@models/ControlSettings';

export type ActionListener = (action: InputAction) => void;

export default class Input {
  private _player: ControllablePlayer;
  private _simulation: Simulation;
  private _grid: Grid;
  private _controls: ControlSettings;
  private _actionListeners: ActionListener[];
  private _keyboardInput: KeyboardInput;
  private _touchInput: TouchInput;

  constructor(
    simulation: Simulation,
    player: ControllablePlayer,
    controls: ControlSettings = DEFAULT_KEYBOARD_CONTROLS
  ) {
    this._simulation = simulation;
    this._grid = simulation.grid;
    this._player = player;
    this._controls = { ...DEFAULT_KEYBOARD_CONTROLS, ...controls }; // ensure newly added controls use default keys
    this._actionListeners = [];
    this._keyboardInput = new KeyboardInput(this._fireAction, this._controls);
    this._touchInput = new TouchInput(this._fireAction);
  }

  get controls(): ControlSettings {
    return this._controls;
  }

  addListener(listener: ActionListener) {
    this._actionListeners.push(listener);
  }

  /**
   * Removes all input listeners.
   */
  destroy() {
    this._keyboardInput.destroy();
    this._touchInput.destroy();
  }

  private _isActionAllowed(action: InputAction) {
    const block: IBlock | undefined = this._player.block;
    if (block && block.isDropping) {
      return false;
    }
    return true;
  }

  private _fireAction = (action: InputAction) => {
    if (!this._simulation.isRunning || !this._isActionAllowed(action)) {
      return;
    }
    const block: IBlock | undefined = this._player.block;
    switch (action) {
      case InputAction.Esc:
        this._player.cancelChat();
        break;
      case InputAction.Chat:
        this._player.toggleChat();
        break;
      case InputAction.MoveLeft:
      case InputAction.MoveRight:
      case InputAction.MoveDown:
        block?.move(
          action === InputAction.MoveLeft
            ? -1
            : action === InputAction.MoveRight
            ? 1
            : 0,
          action === InputAction.MoveDown ? 1 : 0,
          0
        );
        break;
      case InputAction.Drop:
        block?.drop();
        break;
      case InputAction.RotateClockwise:
      case InputAction.RotateAnticlockwise:
        block?.move(0, 0, action === InputAction.RotateClockwise ? 1 : -1);
    }

    this._actionListeners.forEach((listener) => listener(action));
  };
}
