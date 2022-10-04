import IBlock from '@models/IBlock';
import { InputActionWithData } from '@models/InputAction';
import IBlockEventListener from './IBlockEventListener';
import ICell from './ICell';

export enum PlayerStatus {
  ingame,
  knockedOut,
  spectating,
}

export type NetworkPlayerInfo = {
  readonly nickname: string;
  readonly color: number;
  readonly characterId?: string;
  readonly patternFilename?: string;
  readonly id: number;
  readonly score: number;
  readonly health: number;
  readonly status: PlayerStatus;
  readonly isBot: boolean;
  readonly isPremium: boolean;
  readonly isNicknameVerified: boolean;
  readonly isFirstBlock: boolean;
  readonly isChatting: boolean;
};

export interface IPlayer {
  get nickname(): string;
  get color(): number;
  set color(color: number);
  get patternFilename(): string | undefined;
  set patternFilename(patternFilename: string | undefined);
  get characterId(): string | undefined;
  get id(): number;
  get isControllable(): boolean;
  get isBot(): boolean;
  get isNetworked(): boolean;
  get isPremium(): boolean;
  get isNicknameVerified(): boolean;
  get status(): PlayerStatus;
  set spawnLocation(cell: { row: number; column: number } | undefined);
  set checkpointCell(cell: ICell | undefined);
  get checkpointCell(): ICell | undefined;

  get block(): IBlock | undefined;
  get score(): number;
  set score(score: number);
  get health(): number;
  set health(health: number);
  get estimatedSpawnDelay(): number;
  set estimatedSpawnDelay(estimatedSpawnDelay: number);
  set status(status: PlayerStatus);
  set characterId(characterId: string | undefined);
  get lastStatusChangeTime(): number;
  get firedActions(): InputActionWithData[];
  toggleChat(cancel?: boolean): void;

  set isChatting(isChatting: boolean);
  get isChatting(): boolean;
  get isFirstBlock(): boolean;
  set isFirstBlock(isFirstBlock: boolean);

  get requiresFullRerender(): boolean;
  set requiresFullRerender(requiresFullRerender: boolean);

  update(): void;
  addEventListener(eventListener: IBlockEventListener): void;
  onLineClearCellReward(numRowsCleared: number): void;
  createBlock(
    blockId: number,
    row: number,
    column: number,
    rotation: number,
    layoutIndex: number,
    force: boolean
  ): void;
  destroy(): void;
  removeBlock(): void;
  saveSpawnPosition(block: IBlock): void;
  fireActionNextFrame(action: InputActionWithData): void;
}
