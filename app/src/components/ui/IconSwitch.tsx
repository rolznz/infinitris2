import { borderColor } from '@/theme/theme';
import { SvgIcon, Switch, SwitchProps } from '@mui/material';

import React from 'react';
import { CSSProperties } from 'react-transition-group/node_modules/@types/react';

/*const useStyles = makeStyles((theme) => ({
  iconBase: {
    position: 'relative',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    top: '-2px',
    left: '-2px',
    padding: '3px',
    color: theme.palette.secondary.contrastText,
  },
  iconChecked: {
    backgroundColor: theme.palette.secondary.light,
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
  },
}));*/

type IconSwitchProps = SwitchProps & {
  checkediconStyle?: CSSProperties;
  iconStyle?: CSSProperties;
};

export function IconSwitch({
  checkediconStyle,
  iconStyle,
  ...props
}: IconSwitchProps) {
  //const styles = useStyles();
  function wrapIcon(icon: React.ReactNode, checked: boolean) {
    return (
      <SvgIcon
        fontSize="small"
        className={[
          //styles.iconBase,
          //checked ? styles.iconChecked : styles.icon,
        ].join(' ')}
        style={checked ? checkediconStyle : iconStyle}
      >
        {icon}
      </SvgIcon>
    );
  }
  return (
    <Switch
      {...props}
      icon={wrapIcon(props.icon, false)}
      checkedIcon={wrapIcon(props.checkedIcon, true)}
      style={{}}
    />
  );
}
