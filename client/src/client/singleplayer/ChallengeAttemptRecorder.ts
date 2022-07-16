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
  reset(simulation: ISimulation) {
    this._recording = {
      frames: [],
      simulationRootSeed: simulation.rootSeed,
    };
  }
  record(actions: InputActionWithData[]) {
    const validActions = actions.filter(
      (action) =>
        recordableActions.indexOf(action.type as CustomizableInputAction) > -1
    );
    this._recording.frames.push({
      actions: validActions.length ? validActions : undefined, // firestore does not support empty arrays :/
    });
  }
}
