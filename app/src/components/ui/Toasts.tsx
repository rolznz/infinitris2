import { makeStyles } from '@material-ui/core';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles((theme) => ({
  body: {},
  toast: {
    backgroundColor: theme.palette.background.paper,
    '& svg': {
      color: 'white',
    },
  },
}));

export function Toasts() {
  const classes = useStyles();
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      bodyClassName={classes.body}
      toastClassName={classes.toast}
    />
  );
}
