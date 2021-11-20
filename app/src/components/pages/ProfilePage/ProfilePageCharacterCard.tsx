import FlexBox from '@/components/ui/FlexBox';
import { useUser, useUserStore } from '@/state/UserStore';
import { borderRadiuses } from '@/theme';
import { Link, SvgIcon, TextField, useMediaQuery } from '@material-ui/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterStatList } from '../Characters/CharacterStatList';
import { PlacingStar } from '../Characters/PlacingStar';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { FilledIcon } from '@/components/ui/FilledIcon';

export function ProfilePageCharacterCard() {
  const isSmallScreen = useMediaQuery(`(max-width:600px)`);
  const intl = useIntl();
  const user = useUser();
  const userStore = useUserStore();
  return (
    <FlexBox
      style={{
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0px 4px 4px 2px rgba(0, 0, 0, 0.5)',
        background: 'rgba(248, 248, 246, 0.3)',
      }}
      borderRadius={borderRadiuses.base}
      py={5}
      position="relative"
    >
      <FlexBox position="absolute" top={0} right={0}>
        <Link component={RouterLink} underline="none" to={Routes.market}>
          <FilledIcon
            style={{
              width: '50px',
              height: '50px',
              transform: 'translate(50%, -50%)',
            }}
          >
            <MarketIcon />
          </FilledIcon>
        </Link>
      </FlexBox>
      <FlexBox position="relative">
        <TextField
          placeholder={intl.formatMessage({
            defaultMessage: 'Enter your nickname',
            description: 'Nickname textbox placeholder',
          })}
          value={user.readOnly?.nickname || 'New Player'}
          onChange={(e) => userStore.setNickname(e.target.value)}
          inputProps={{ style: { textAlign: 'center', color: '#ffffff' } }}
          InputProps={{
            //classes: { input: classes.nicknameInput },
            disableUnderline: true,
            autoFocus: true,
            style: {
              backgroundColor: '#a7d9f5',
              borderRadius: 32,
              padding: 4,
              paddingLeft: 8,
              borderColor: '#ffffff44',
              borderWidth: 6,
              borderStyle: 'solid',
              backgroundClip: 'padding-box',
              filter: 'drop-shadow(0 0 0.75rem white)',
            },
          }}
        />
        <FlexBox mt={-2} position="relative">
          <PlacingStar
            placing={undefined}
            offset={isSmallScreen ? 60 : 90}
            scale={1.7}
          />
          <CharacterImage characterId="0" width={400} />
        </FlexBox>
        <FlexBox mt={-5}>
          <CharacterStatList
            networkImpact={user.readOnly?.networkImpact}
            coins={user.readOnly?.coins}
          />
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}
