import useTheme from '@mui/material/styles/useTheme';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Toasts() {
  const theme = useTheme();
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
      toastStyle={{
        backgroundColor: theme.palette.background.paper,
        /*'& svg': {
          color: 'white',
        },*/
      }}
    />
  );
}
