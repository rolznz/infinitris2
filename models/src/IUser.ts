import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import { TutorialStatus } from './TutorialStatus';

export default interface IUser {
  readonly tutorialAttempts: { [tutorialId: string]: TutorialStatus[] };
  readonly hasSeenWelcome: boolean;
  readonly nickname: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  readonly completedTutorialIds: string[];
  readonly controls: ControlSettings;
}
