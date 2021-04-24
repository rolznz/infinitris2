import ICell from './ICell';
import ICellBehaviour from './ICellBehaviour';

export default interface ICellEventListener {
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour): void;
}
