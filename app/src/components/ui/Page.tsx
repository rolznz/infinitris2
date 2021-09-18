import { Box, makeStyles, Typography } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import React, { CSSProperties } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import FlexBox from './FlexBox';

type PageProps = {
  title?: React.ReactElement;
  useGradient?: boolean;
  style?: CSSProperties;
};

export function Page(props: React.PropsWithChildren<PageProps>) {
  const isDarkMode = useDarkMode();
  const useStyles = makeStyles((theme) => ({
    title: {},
    page: {
      flex: 1,
      padding: theme.spacing(4),
      maxWidth: '100%',
      ...(props.useGradient
        ? {
            background: isDarkMode
              ? 'linear-gradient(180deg, rgba(8,27,41,1) 0%, rgba(0,60,67,1) 35%, rgba(10,21,41,1) 100%)'
              : 'linear-gradient(180deg, rgba(30,68,143,1) 0%, rgba(49,168,221,1) 35%, rgba(26,34,82,1) 100%)',
          }
        : {
            backgroundColor: theme.palette.background.paper,
          }),
    },
  }));

  const classes = useStyles();

  return (
    <FlexBox
      className={classes.page}
      style={props.style}
      justifyContent="flex-start"
    >
      {props.title && (
        <>
          <Box mt={10} />
          <Typography variant="h1" className={classes.title}>
            {props.title}
          </Typography>
          <Box mb={4} />
        </>
      )}
      {props.children}
    </FlexBox>
  );
}
