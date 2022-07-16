import { ChallengeAttemptRecording } from '@models/IChallengeAttempt';
import { IPlayer } from '@models/IPlayer';

export class ChallengeAttemptRecordPlayer {
  private _recording: ChallengeAttemptRecording | undefined;
  private _frame!: number;
  private _player!: IPlayer;

  reset(player: IPlayer, recording: ChallengeAttemptRecording | undefined) {
    this._recording = recording;
    this._frame = 0;
    this._player = player;
  }

  step() {
    if (!this._recording || this._frame >= this._recording.frames.length) {
      return;
    }
    const frame = this._recording.frames[this._frame++];
    for (const action of frame.actions) {
      this._player.fireActionNextFrame(action);
    }
  }
}