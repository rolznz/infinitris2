enum CellType {
  Normal = 'Normal',
  Laser = 'Laser',
  Deadly = 'Deadly',
  Key = 'Key',
  Lock = 'Lock',
  FinishChallenge = 'FinishChallenge',
  Wafer = 'Wafer', // dropping causes wafer to explode, standard placement does not explode
  Infection = 'Infection', // each block placement causes the infection to grow
  RockGenerator = 'RockGenerator',
  Rock = 'Rock',
  SpawnLocation = 'SpawnLocation',
  Gesture = 'Gesture',
  ReverseLock = 'ReverseLock',
  Checkpoint = 'Checkpoint',
  Switch = 'Switch',
  BridgeCreator = 'BridgeCreator',
  // Water/Liquid?
}

export default CellType;
