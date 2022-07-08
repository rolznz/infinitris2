import longsOnly from '@models/blockLayouts/longsOnly';
import lsOnly from '@models/blockLayouts/lsOnly';
import osOnly from '@models/blockLayouts/osOnly';
import pentominoes from '@models/blockLayouts/Pentominoes';
import sShapesOnly from '@models/blockLayouts/sShapesOnly';
import tetrominoes from '@models/blockLayouts/Tetrominoes';
import trominoes from '@models/blockLayouts/Trominoes';
import tsOnly from '@models/blockLayouts/tsOnly';
import { LayoutSet } from '@models/Layout';

export const blockLayoutSets: LayoutSet[] = [
  tetrominoes,
  lsOnly,
  osOnly,
  tsOnly,
  sShapesOnly,
  longsOnly,
  trominoes,
  pentominoes,
];
