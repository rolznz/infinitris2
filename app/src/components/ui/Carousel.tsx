import {
  Button,
  makeStyles,
  MobileStepper,
  Paper,
  Typography,
  useTheme,
} from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import React from 'react';
import SwipeableViews from 'react-swipeable-views';

type CarouselProps = {
  pages: React.ReactNode[];
};

const swipeableViewsStyles = {
  root: {
    padding: '0 50px',
    maxWidth: '400px',
  },
  slideContainer: {
    padding: '0 0px',
    display: 'flex',
  },
  slide: {
    padding: 15,
    color: '#fff',
    flexGrow: 1,
  },
};

export function Carousel({ pages }: React.PropsWithChildren<CarouselProps>) {
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
        style={swipeableViewsStyles.root}
        slideStyle={swipeableViewsStyles.slideContainer}
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
