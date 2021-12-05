import { MobileStepper } from '@material-ui/core';
import lodashMerge from 'lodash.merge';
import React from 'react';
import SwipeableViews from 'react-swipeable-views';

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

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <div>
      <SwipeableViews
        index={activeStep}
        onChangeIndex={handleStepChange}
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
