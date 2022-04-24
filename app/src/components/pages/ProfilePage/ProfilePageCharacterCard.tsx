import FlexBox from '@/components/ui/FlexBox';
import { useUser, useUserStore } from '@/state/UserStore';
import { borderColorLight, borderRadiuses } from '@/theme/theme';
import { Link, TextField, useMediaQuery } from '@mui/material';
import React from 'react';
import { useIntl } from 'react-intl';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterStatList } from '../Characters/CharacterStatList';
import { PlacingStar } from '../Characters/PlacingStar';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { ReactComponent as MarketIcon } from '@/icons/market.svg';
import { FilledIcon } from '@/components/ui/FilledIcon';
import { LocalUser } from '@/state/LocalUserStore';
import { debounce } from 'ts-debounce';
import { ReactComponent as TickIcon } from '@/icons/tick.svg';

export function ProfilePageCharacterCard() {
  const isSmallScreen = useMediaQuery(`(max-width:600px)`);
  const intl = useIntl();
  const user = useUser();
  const userStore = useUserStore();
  const characterId = (user as LocalUser).characterId;
  const setNickname = userStore.setNickname;

  const updateUsername = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNickname(e.target.value);
    },
    [setNickname]
  );

  return (
    <FlexBox
      style={{
        border: '4px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 4px 4px 2px rgba(0, 0, 0, 0.5)',
        background: 'rgba(248, 248, 246, 0.1)',
      }}
      borderRadius={borderRadiuses.base}
      py={5}
      position="relative"
      key={user?.id}
    >
      <FlexBox
        position="absolute"
        top={borderRadiuses.sm}
        right={borderRadiuses.sm}
      >
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
            defaultMessage: 'nickname',
            description: 'Nickname textbox placeholder',
          })}
          // TODO: nickname tick when matches
          // TODO: add nickname to IUser
          defaultValue={(user as LocalUser).nickname || user.readOnly?.nickname}
          //value={user.readOnly?.nickname}
          onChange={debounce(updateUsername, 500)}
          inputProps={{ style: { textAlign: 'center', color: '#ffffff' } }}
          InputProps={{
            //classes: { input: classes.nicknameInput },
            disableUnderline: true,
            autoFocus: true,
            style: {
              backgroundColor: borderColorLight,
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
        {user.readOnly?.nickname &&
          user.readOnly?.nickname === (user as LocalUser).nickname && (
            <FlexBox>
              <TickIcon /> verified
            </FlexBox>
          )}
        <FlexBox mt={-2} position="relative">
          <CharacterImage characterId={characterId} width={400} />
          <PlacingStar
            placing={undefined}
            offset={isSmallScreen ? 60 : 90}
            scale={1.7}
          />
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
