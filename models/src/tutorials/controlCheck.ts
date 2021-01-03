import tetrominoes from '../Tetrominoes';
import ITutorial from '../ITutorial';

const controlCheck: ITutorial = {
  id: 'control-check',
  title: 'Control Check',
  locale: 'en',
  highlightScore: true,
  layout: tetrominoes.L,
  gridNumRows: 35,
  gridNumColumns: 100,
  maxBlocks: 1,
  simulationSettings: {
    spawnRowOffset: 5,
    gravityEnabled: false,
  },
  allowedActions: [],
  teachControls: true,
  mandatory: true,
  priority: 10000,
  translations: {
    th: {
      title: 'ตรวจสอบการควบคุม',
    },
  },
};

export default controlCheck;
