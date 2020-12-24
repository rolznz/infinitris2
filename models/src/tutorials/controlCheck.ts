import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const controlCheck: Tutorial = {
  id: 'control-check',
  title: 'Control Check',
  description: "Let's go through the basic controls",
  highlightScore: true,
  layout: tetrominoes.L,
  gridNumRows: 35,
  gridNumColumns: 100,
  simulationSettings: {
    spawnRowOffset: 5,
    gravityEnabled: false,
  },
  allowedActions: [],
  teachControls: true,
  mandatory: true,
  priority: 10000,
};

export default controlCheck;
