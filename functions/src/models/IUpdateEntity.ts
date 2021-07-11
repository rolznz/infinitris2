import IUpdateEntityReadOnly from './IUpdateEntityReadOnly';

export default interface IUpdateEntity extends IUpdateEntityReadOnly {
  created?: boolean;
}
