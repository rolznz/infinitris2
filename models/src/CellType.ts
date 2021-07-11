enum CellType {
  Normal = 'Normal',
  Laser = 'Laser',
  Deadly = 'Deadly',
  Key = 'Key',
  Lock = 'Lock',
  // TODO: InverseLock (RGB) - locks when keys are taken
  FinishChallenge = 'FinishChallenge',
  Wafer = 'Wafer', // dropping causes wafer to explode, standard placement does not explode
  Infection = 'Infection', // each block placement causes the infection to grow
  // TODO: cells that can hold a certain amount of weight
}

export default CellType;
