import lsOnly from '@models/blockLayouts/lsOnly';
import osOnly from '@models/blockLayouts/osOnly';
import tetrominoes from '@models/blockLayouts/Tetrominoes';
import { LayoutSet } from '@models/Layout';

export const blockLayoutSets: LayoutSet[] = [tetrominoes, lsOnly, osOnly];
