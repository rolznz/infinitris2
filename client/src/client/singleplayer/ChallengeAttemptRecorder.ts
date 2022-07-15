import { ChallengeAttemptRecording } from '@models/IChallengeAttempt';
import {
  CustomizableInputAction,
  InputActionWithData,
} from '@models/InputAction';
import ISimulation from '@models/ISimulation';

const recordableActions: CustomizableInputAction[] = [
  CustomizableInputAction.MoveLeft,
  CustomizableInputAction.MoveRight,
  CustomizableInputAction.MoveDown,
  CustomizableInputAction.RotateAnticlockwise,
  CustomizableInputAction.RotateClockwise,
  CustomizableInputAction.Drop,
];
export class ChallengeAttemptRecorder {
  private _recording!: ChallengeAttemptRecording;

  constructor() {}

  get recording(): ChallengeAttemptRecording {
    return this._recording;
  }
  reset() {
    this._recording = { frames: [] };
  }
  record(actions: InputActionWithData[]) {
    this._recording.frames.push({
      actions: actions.filter(
        (action) =>
          recordableActions.indexOf(action.type as CustomizableInputAction) > -1
      ),
    });
  }
}
