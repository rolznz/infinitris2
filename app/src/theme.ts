import { createMuiTheme } from '@material-ui/core';
import { SkeletonClassKey } from '@material-ui/lab/Skeleton';

declare module '@material-ui/core/styles/overrides' {
  export interface ComponentNameToClassKey {
    MuiSkeleton: SkeletonClassKey;
  }
}

const theme = createMuiTheme({
  overrides: {
    MuiSkeleton: {
      rect: {
        borderRadius: 4,
      },
    },
  },
});

export default theme;
