import { SvgIcon, Switch, SwitchProps } from '@mui/material';

import React from 'react';
import { CSSProperties } from 'react-transition-group/node_modules/@types/react';

type IconSwitchProps = SwitchProps & {
  checkediconStyle?: CSSProperties;
  iconStyle?: CSSProperties;
};

export function IconSwitch({
  checkediconStyle,
  iconStyle,
  ...props
}: IconSwitchProps) {
  function wrapIcon(icon: React.ReactNode, checked: boolean) {
    return (
      <SvgIcon
        fontSize="small"
        sx={{
          position: 'relative',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          top: '-2px',
          left: '-2px',
          padding: '3px',
          color: 'secondary.contrastText',
          backgroundColor: checked ? 'secondary.light' : 'secondary.main',
        }}
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
