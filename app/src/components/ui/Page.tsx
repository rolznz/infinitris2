import { appName } from '@/utils/constants';
import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { CSSProperties } from 'react';
import { Helmet } from 'react-helmet';
import useDarkMode from '../hooks/useDarkMode';
import FlexBox from './FlexBox';

type PageProps = {
  title?: string;
  titleImage?: React.ReactNode;
  showTitle?: boolean;
  useGradient?: boolean;
  style?: CSSProperties;
  narrow?: boolean;
  paddingX?: number;
};

export function Page({
  showTitle = true,
  ...props
}: React.PropsWithChildren<PageProps>) {
  const isDarkMode = useDarkMode();
  // TODO: move out of component
  const useStyles = makeStyles((theme) => ({
    title: {},
    page: {
      flex: 1,
      width: '100%',
      minHeight: '100vh',
      padding: theme.spacing(4),
      ...(props.paddingX !== undefined
        ? {
            paddingLeft: props.paddingX,
            paddingRight: props.paddingX,
          }
        : {}),
      maxWidth: '100%',
      ...(props.useGradient && false
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
  const childContainer = (children?: React.ReactNode) =>
    props.narrow ? (
      <FlexBox width={375} maxWidth="100%">
        {children}
      </FlexBox>
    ) : (
      <>{children}</>
    );

  return (
    <FlexBox
      className={classes.page}
      justifyContent="flex-start"
      style={props.style}
    >
      {props.titleImage}
      {props.title && (
        <>
          <Helmet>
            <title>
              {appName} - {props.title}
            </title>
          </Helmet>
          {showTitle && (
            <>
              <Box mt={props.titleImage ? 5 : 10} />
              <Typography variant="h1" className={classes.title}>
                {props.title}
              </Typography>
              <Box mb={4} />
            </>
          )}
        </>
      )}
      {childContainer(props.children)}
    </FlexBox>
  );
}
