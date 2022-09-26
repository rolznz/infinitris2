import ControllablePlayer from '../ControllablePlayer';
import InputAction, {
  CustomizableInputAction,
  InputActionListener,
  InputActionWithData,
  RotateActionWithData,
} from '@models/InputAction';
import IBlock from '@models/IBlock';
import KeyboardInput from './KeyboardInput';
import TouchInput from './TouchInput';
import GamepadInput from '@src/input/GamepadInput';
import ControlSettings, {
  DEFAULT_KEYBOARD_CONTROLS,
} from '@models/ControlSettings';
import MouseInput from '@src/input/MouseInput';
import ICell from '@models/ICell';
import ISimulation from '@models/ISimulation';

export type ScreenPositionToCell = (x: number, y: number) => ICell | undefined;

export default class Input {
  private _player: ControllablePlayer;
  private _controls: ControlSettings;
  private _actionListeners: InputActionListener[];
  private _keyboardInput: KeyboardInput;
  private _mouseInput?: MouseInput;
  private _touchInput: TouchInput;
  private _gamepadInput?: GamepadInput;
  private _challengeEditorEnabled: boolean;
  private _simulation: ISimulation;
  private _chatEnabled: boolean;
  private _playerActionsEnabled: boolean;

  constructor(
    simulation: ISimulation,
    onInputAction: InputActionListener,
    screenPositionToCell: ScreenPositionToCell,
    player: ControllablePlayer,
    keyboardControls: ControlSettings = DEFAULT_KEYBOARD_CONTROLS,
    gamepadControls?: ControlSettings,
    challengeEditorEnabled = false,
    chatEnabled = true,
    customRepeatInitialDelay?: number,
    customRepeatRate?: number,
    allowRepeatedRotations?: boolean
  ) {
    this._chatEnabled = chatEnabled;
    this._simulation = simulation;
    this._player = player;
    this._controls = { ...DEFAULT_KEYBOARD_CONTROLS, ...keyboardControls }; // ensure newly added controls use default keys
    this._actionListeners = [onInputAction];
    this._keyboardInput = new KeyboardInput(
      this._fireAction,
      this._controls,
      customRepeatInitialDelay,
      customRepeatRate,
      allowRepeatedRotations
    );
    this._touchInput = new TouchInput(this._fireAction);
    this._challengeEditorEnabled = challengeEditorEnabled;
    this._playerActionsEnabled = true;
    if (gamepadControls) {
      this._gamepadInput = new GamepadInput(
        this._fireAction,
        gamepadControls,
        customRepeatInitialDelay,
        customRepeatRate
      );
    }
    if (this._challengeEditorEnabled) {
      this._mouseInput = new MouseInput(this._fireAction, screenPositionToCell);
    }
  }

  get controls(): ControlSettings {
    return this._controls;
  }
  get playerActionsEnabled(): boolean {
    return this._playerActionsEnabled;
  }
  set playerActionsEnabled(isEnabled: boolean) {
    this._playerActionsEnabled = isEnabled;
  }

  addListener(listener: InputActionListener) {
    this._actionListeners.push(listener);
  }

  /**
   * Removes all input listeners.
   */
  destroy() {
    this._keyboardInput.destroy();
    this._touchInput.destroy();
    this._gamepadInput?.destroy();
    this._mouseInput?.destroy();
  }

  private _isActionAllowed(action: InputAction) {
    if (
      this._player.isChatting &&
      action !== CustomizableInputAction.Esc &&
      action !== CustomizableInputAction.Chat
    ) {
      return false;
    }
    const block: IBlock | undefined = this._player.block;
    if (block && block.isDropping) {
      return false;
    }
    return true;
  }

  private _fireAction = (action: InputActionWithData) => {
    if (
      !this._challengeEditorEnabled &&
      /*!this._simulation.isRunning || */ !this._isActionAllowed(action.type)
    ) {
      return;
    }

    switch (action.type) {
      case CustomizableInputAction.Esc:
        this._player.cancelChat();
        break;
      case CustomizableInputAction.Chat:
        if (this._chatEnabled) {
          this._player.toggleChat();
        }
        break;
    }
    if (this._simulation.isRunning && this._playerActionsEnabled) {
      this._player.fireActionNextFrame(action);
    }

    this._actionListeners.forEach((listener) => listener(action));
  };
}
