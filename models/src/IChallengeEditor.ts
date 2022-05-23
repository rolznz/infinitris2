import ChallengeCellType from '@models/ChallengeCellType';
import { InputActionListener } from '@models/InputAction';
import ISimulation from '@models/ISimulation';

export interface IChallengeEditorEventListener {
  onSaveGrid(editor: IChallengeEditor, grid: string): void;
  onToggleIsEditing(editor: IChallengeEditor): void;
  onChangeChallengeCellType(editor: IChallengeEditor): void;
}

export interface IChallengeEditor {
  get isEditing(): boolean;
  set isEditing(isEditing: boolean);
  set simulation(simulation: ISimulation);
  get inputActionListener(): InputActionListener;
  get challengeCellType(): ChallengeCellType;
  set challengeCellType(challengeCellType: ChallengeCellType);
  setGridSize(
    numRows: number,
    numColumns: number,
    atRow: number,
    atColumn: number
  ): void;
  //insertRows(numRows: number, atRow: number): void;
  //insertColumns(numColumns: number, atColumn: number): void;
}
