import { Box, MobileStepper, SvgIcon, SxProps } from '@mui/material';
import lodashMerge from 'lodash.merge';
import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { useWindowSize } from 'react-use';
import LeftIcon from '@mui/icons-material/ChevronLeft';
import RightIcon from '@mui/icons-material/ChevronRight';
import FlexBox from './FlexBox';
import { colors, zIndexes } from '@/theme/theme';

type SwipeableViewsStyles = {
  root: React.CSSProperties;
  slideContainer: React.CSSProperties;
  slide: React.CSSProperties;
};

const coreSwipeableViewsStyles: SwipeableViewsStyles = {
  root: {},
  slideContainer: {
    padding: '15px 5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    padding: '0 15px',
    color: '#fff',
    flexGrow: 1,
  },
};

export const narrowSwipeableViewsStyles: SwipeableViewsStyles = lodashMerge(
  {},
  coreSwipeableViewsStyles,
  {
    root: {
      padding: '0px 50px',
      maxWidth: '400px',
    },
  }
);

type CarouselProps = {
  slides: React.ReactNode[];
  styles?: SwipeableViewsStyles;
  blurEdges?: boolean;
};

export function Carousel({
  slides: pages,
  styles = coreSwipeableViewsStyles,
  blurEdges,
}: React.PropsWithChildren<CarouselProps>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width > windowSize.height;
  const arrowDistance = 100;

  return (
    <div style={{ position: 'relative' }}>
      {blurEdges && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            boxShadow: (theme) =>
              `inset 12px 0 15px 0px ${theme.palette.background.paper}, inset -12px 0 15px 0px ${theme.palette.background.paper}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {isLandscape && (
        <CarouselArrow
          icon={<LeftIcon />}
          sx={{
            left: -arrowDistance,
            transform: 'translate(-50%,-50%)',
          }}
          onClick={() => setActiveStep(activeStep - 1)}
          enabled={activeStep > 0}
        />
      )}
      {isLandscape && (
        <CarouselArrow
          icon={<RightIcon />}
          sx={{
            right: -arrowDistance,
            transform: 'translate(50%,-50%)',
          }}
          onClick={() => setActiveStep(activeStep + 1)}
          enabled={activeStep < pages.length - 1}
        />
      )}
      <SwipeableViews
        index={activeStep}
        onChangeIndex={setActiveStep}
        enableMouseEvents
        style={styles.root}
        slideStyle={styles.slideContainer}
      >
        {pages}
      </SwipeableViews>
      <MobileStepper
        steps={pages.length}
        position="static"
        variant="dots"
        activeStep={activeStep}
        nextButton={null}
        backButton={null}
      />
    </div>
  );
}

type CarouselArrowProps = {
  icon: React.ReactNode;
  sx: SxProps;
  onClick(): void;
  enabled: boolean;
};

function CarouselArrow({ icon, sx, onClick, enabled }: CarouselArrowProps) {
  return (
    <FlexBox
      sx={{
        position: 'absolute',
        top: '50%',
        padding: 1,
        zIndex: zIndexes.above,
        filter: 'drop-shadow( 0px 0px 5px rgba(0, 0, 0, .9))',
        cursor: 'pointer',
        opacity: enabled ? 0.9 : 0.3,
        ...sx,
      }}
      onClick={() => enabled && onClick()}
    >
      <SvgIcon
        sx={{
          fontSize: '80px',
          color: colors.white,
        }}
      >
        {icon}
      </SvgIcon>
    </FlexBox>
  );
}
