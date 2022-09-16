import ChallengeCellType from '@models/ChallengeCellType';
import { WorldType, WorldVariation } from '@models/WorldType';

// TODO: add .env file to models project
export const clientImagesDirectory = 'https://infinitris.net/client/images';
export const clientChallengePreviewBackgroundImagesDirectory = `${clientImagesDirectory}/challenge-previews`;
export const clientCellImagesDirectory = `${clientImagesDirectory}/cells`;

export function getCellTypePreviewImageUrl(
  cellType: ChallengeCellType,
  worldType: WorldType = 'grass',
  worldVariation: WorldVariation = '0'
): string | undefined {
  worldType = 'grass'; // TODO: remove hardcoding once other world assets are available
  switch (cellType) {
    case ChallengeCellType.Full:
      return getChallengeTypeUrlInternal('fill', worldType, worldVariation);
    case ChallengeCellType.RockGenerator:
      return getChallengeTypeUrlInternal(
        'rock-generator',
        worldType,
        worldVariation
      );
    case ChallengeCellType.RedKey:
      return getChallengeTypeUrlInternal('key_red');
    case ChallengeCellType.BlueKey:
      return getChallengeTypeUrlInternal('key_blue');
    case ChallengeCellType.GreenKey:
      return getChallengeTypeUrlInternal('key_green');
    case ChallengeCellType.YellowKey:
      return getChallengeTypeUrlInternal('key_yellow');
    case ChallengeCellType.RedLock:
      return getChallengeTypeUrlInternal('lock_red');
    case ChallengeCellType.BlueLock:
      return getChallengeTypeUrlInternal('lock_blue');
    case ChallengeCellType.GreenLock:
      return getChallengeTypeUrlInternal('lock_green');
    case ChallengeCellType.YellowLock:
      return getChallengeTypeUrlInternal('lock_yellow');
    case ChallengeCellType.ReverseRedLock:
      return getChallengeTypeUrlInternal('reverse_lock_red');
    case ChallengeCellType.ReverseBlueLock:
      return getChallengeTypeUrlInternal('reverse_lock_blue');
    case ChallengeCellType.ReverseGreenLock:
      return getChallengeTypeUrlInternal('reverse_lock_green');
    case ChallengeCellType.ReverseYellowLock:
      return getChallengeTypeUrlInternal('reverse_lock_yellow');
    case ChallengeCellType.RedSwitch:
      return getChallengeTypeUrlInternal('switch_red_on');
    case ChallengeCellType.BlueSwitch:
      return getChallengeTypeUrlInternal('switch_blue_on');
    case ChallengeCellType.GreenSwitch:
      return getChallengeTypeUrlInternal('switch_green_on');
    case ChallengeCellType.YellowSwitch:
      return getChallengeTypeUrlInternal('switch_yellow_on');
    case ChallengeCellType.Checkpoint:
      return getChallengeTypeUrlInternal('checkpoint');
    case ChallengeCellType.SpawnLocation:
      return getChallengeTypeUrlInternal('spawn');
    case ChallengeCellType.Finish:
      return getChallengeTypeUrlInternal('finish');
    case ChallengeCellType.Infection:
      return getChallengeTypeUrlInternal('virus', worldType, worldVariation);
    case ChallengeCellType.Wafer:
      return getChallengeTypeUrlInternal('wafer');
    case ChallengeCellType.Deadly:
      return getChallengeTypeUrlInternal('deadly', worldType, worldVariation);
    case ChallengeCellType.GestureMoveLeft:
      return getChallengeTypeUrlInternal('gesture_left');
    case ChallengeCellType.GestureMoveRight:
      return getChallengeTypeUrlInternal('gesture_right');
    case ChallengeCellType.GestureMoveDown:
      return getChallengeTypeUrlInternal('gesture_down');
    case ChallengeCellType.GestureDrop:
      return getChallengeTypeUrlInternal('gesture_drop');
    case ChallengeCellType.GestureRotateClockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_clockwise');
    case ChallengeCellType.GestureRotateAnticlockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_anticlockwise');
    case ChallengeCellType.GestureRotateDownClockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_down_clockwise');
    case ChallengeCellType.GestureRotateDownAnticlockwise:
      return getChallengeTypeUrlInternal('gesture_rotate_down_anticlockwise');
    default:
      return undefined;
  }
}

function getChallengeTypeUrlInternal(
  image: string,
  worldType?: WorldType,
  worldVariation?: WorldVariation
): string {
  return `${clientCellImagesDirectory}/${
    worldType ? worldType + '/' : ''
  }${image}${
    worldVariation && worldVariation !== '0'
      ? `_variation${worldVariation}`
      : ''
  }.png`;
}
