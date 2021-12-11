import { MobileStepper, SvgIcon, SxProps } from '@mui/material';
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
    padding: '0 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    padding: 15,
    color: '#fff',
    flexGrow: 1,
  },
};

export const narrowSwipeableViewsStyles: SwipeableViewsStyles = lodashMerge(
  {},
  coreSwipeableViewsStyles,
  {
    root: {
      padding: '0 50px',
      maxWidth: '400px',
    },
  }
);

type CarouselProps = {
  pages: React.ReactNode[];
  styles?: SwipeableViewsStyles;
};

export function Carousel({
  pages,
  styles = coreSwipeableViewsStyles,
}: React.PropsWithChildren<CarouselProps>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width > windowSize.height;

  return (
    <div style={{ position: 'relative' }}>
      {isLandscape && (
        <CarouselArrow
          icon={<LeftIcon />}
          sx={{
            left: 0,
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
            right: 0,
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
