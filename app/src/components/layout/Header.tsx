import {
  Box,
  IconButton,
  Link,
  makeStyles,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import React from 'react';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '../../models/Routes';
import { supportedLocales } from '../../internationalization';
import useAppStore from '../../state/AppStore';
import { useIntl } from 'react-intl';

export default function Header() {
  const useStyles = makeStyles({
    languageSelect: {
      marginLeft: 8,
      marginRight: 8,
      '& div': {
        padding: '0 !important',
        width: '48px',
        height: '48px',
        borderRadius: '24px !important',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
  });
  const classes = useStyles();
  const appStore = useAppStore();
  const intl = useIntl();

  return (
    <Box
      width="100%"
      zIndex={1}
      justifyContent="flex-end"
      display="flex"
      alignItems="center"
    >
      <Tooltip
        title={intl.formatMessage({
          defaultMessage: 'Single Player',
          description: 'Single player button tooltip',
        })}
      >
        <Link component={RouterLink} underline="none" to={Routes.singlePlayer}>
          <IconButton>
            <SportsEsportsIcon />
          </IconButton>
        </Link>
      </Tooltip>
      <Select
        className={classes.languageSelect}
        disableUnderline
        IconComponent={() => <></>}
        value={appStore.user.locale}
        onChange={(event) =>
          appStore.setLanguageCode(event.target.value as string)
        }
      >
        {supportedLocales.map((language) => (
          <MenuItem key={language} value={language}>
            {language.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
