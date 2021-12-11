import { white } from '@/theme';
import { appName } from '@/utils/constants';
import { Box, Typography } from '@mui/material';

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
  background?: React.ReactNode;
  whiteTitle?: boolean;
};

/*
const useStyles = makeStyles((theme) => ({
    title: {
      color: whiteTitle ? white : undefined,
    },
    page: {
      flex: 1,
      width: '100vw',
      overflowX: 'hidden',
      minHeight: '100%',
      padding: theme.spacing(4),
      ...(props.paddingX !== undefined
        ? {
            paddingLeft: props.paddingX,
            paddingRight: props.paddingX,
          }
        : {}),
      maxWidth: '100%',
      ...(background
        ? {}
        : props.useGradient && false
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
  */

export function Page({
  whiteTitle,
  showTitle = true,
  background,
  ...props
}: React.PropsWithChildren<PageProps>) {
  const isDarkMode = useDarkMode();
  // TODO: move out of component

  const childContainer = (children?: React.ReactNode) =>
    props.narrow ? (
      <FlexBox width={375} maxWidth="100%">
        {children}
      </FlexBox>
    ) : (
      <>{children}</>
    );

  return (
    <FlexBox justifyContent="flex-start" style={props.style}>
      {background}
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
              <Typography variant="h1">{props.title}</Typography>
              <Box mb={4} />
            </>
          )}
        </>
      )}
      {childContainer(props.children)}
    </FlexBox>
  );
}
