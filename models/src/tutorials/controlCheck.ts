import tetrominoes from '../layouts/Tetrominoes';
import ITutorial from '../ITutorial';

const controlCheck: ITutorial = {
  id: 'control-check',
  title: 'Control Check',
  locale: 'en',
  layout: tetrominoes.L,
  gridNumRows: 35,
  gridNumColumns: 100,
  simulationSettings: {
    spawnRowOffset: 5,
    gravityEnabled: false,
  },
  finishCriteria: {
    maxBlocks: 1,
  },
  successCriteria: {
    gold: {
      maxTimeTaken: 5000,
    },
    silver: {
      maxTimeTaken: 10000,
    },
    bronze: {},
    all: {
      minBlocksPlaced: 1,
    },
  },
  allowedActions: [],
  teachControls: true,
  isMandatory: true,
  isPublished: true,
  priority: 10000,
  translations: {
    th: {
      title: 'ตรวจสอบการควบคุม',
    },
  },
};

export default controlCheck;
