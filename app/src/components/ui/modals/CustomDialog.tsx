import React from 'react';
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import FlexBox from '../FlexBox';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onClose}
        size="large">
        <CloseIcon />
      </IconButton>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

interface CustomDialogProps {
  dialogId: string;
  title: React.ReactNode;
  isOpen: boolean;
  onClose(): void;
}

export default function CustomDialog({
  isOpen,
  onClose,
  children,
  dialogId,
  title,
}: React.PropsWithChildren<CustomDialogProps>) {
  return (
    <Dialog onClose={onClose} aria-labelledby={dialogId} open={isOpen}>
      <DialogTitle id={dialogId} onClose={onClose}>
        {title}
      </DialogTitle>
      <DialogContent>
        <FlexBox width={300}>{children}</FlexBox>
      </DialogContent>
    </Dialog>
  );
}
