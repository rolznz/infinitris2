import { RingIconButton } from '@/components/ui/RingIconButton';
import { Link, SvgIcon } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type AboutIconProps = {
  to?: string;
  url?: string;
  icon: React.ReactNode;
};

export function AboutIconButton({ to, url, icon }: AboutIconProps) {
  function wrapper(children: React.ReactNode): React.ReactNode {
    return to ? (
      <Link component={RouterLink} to={to}>
        {children}
      </Link>
    ) : (
      <a href={url}>{children}</a>
    );
  }

  return (
    <>
      {wrapper(
        <RingIconButton>
          <SvgIcon color="primary" fontSize="large">
            {icon}
          </SvgIcon>
        </RingIconButton>
      )}
    </>
  );
}