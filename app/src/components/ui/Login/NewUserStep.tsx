import { FormattedMessage } from 'react-intl';
import FlexBox from '../FlexBox';
import localStorageKeys from '@/utils/localStorageKeys';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { CharacterCoinStatChip } from '../../pages/Characters/CharacterStatChip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useLoginStore from '@/state/LoginStore';
import shallow from 'zustand/shallow';
import { Carousel } from '@/components/ui/Carousel';
import React from 'react';
import { borderRadiuses, boxShadows } from '@/theme/theme';
import marketImage from './assets/market_illustration.svg';
import { appName } from '@/utils/constants';

type SignupBenefitProps = {
  text: React.ReactNode;
  image?: string;
};

const imageStyle: React.CSSProperties = {
  width: '200px',
  height: 'auto',
  objectFit: 'cover',
  //boxShadow: boxShadows.small,
  //borderRadius: borderRadiuses.base,
};

function SignupBenefit({ text, image }: SignupBenefitProps) {
  return (
    <FlexBox
      boxShadow={boxShadows.small}
      p={1}
      borderRadius={borderRadiuses.base}
    >
      <img src={image || marketImage} alt="" style={imageStyle} />
      <Typography variant="body2" align="center" mt={1}>
        {text}
      </Typography>
    </FlexBox>
  );
}

const benefitsPages: React.ReactNode[] = [
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Earn coins"
        description="Account benefits text - earn coins"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Access premium characters"
        description="Account benefits text - premium characters"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Earn impact points"
        description="Account benefits text - earn impact points"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Appear on the scoreboard"
        description="Account benefits text - impact & scoreboard"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Publish challenges"
        description="Account benefits text - publish challenges"
      />
    }
  />,
  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Rate challenges"
        description="Account benefits text - rate challenges"
      />
    }
  />,

  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Secure your nickname (tick)"
        description="Account benefits text - nickname"
      />
    }
  />,

  <SignupBenefit
    text={
      <FormattedMessage
        defaultMessage="Gain access to premium rooms"
        description="Account benefits text - verified player access"
      />
    }
  />,
];

export function NewUserStep() {
  const [setViewingBenefits] = useLoginStore(
    (store) => [store.setViewingBenefits],
    shallow
  );

  const [referredByAffiliateId, , deleteReferredByAffiliateId] =
    useLocalStorage<string>(localStorageKeys.referredByAffiliateId, undefined, {
      raw: true,
    });

  return (
    <FlexBox width={400} my={4} maxWidth="100%">
      <Typography variant="body2" align="center">
        <FormattedMessage
          defaultMessage="With a premium account you can:"
          description="New user information"
        />
      </Typography>

      <Carousel slides={benefitsPages} />

      <FlexBox mt={4} />

      <Button
        color="primary"
        variant="contained"
        onClick={() => setViewingBenefits(false)}
      >
        <FormattedMessage
          defaultMessage="Purchase {appName} premium"
          description="Premium registration button text"
          values={{ appName }}
        />
      </Button>

      {referredByAffiliateId && (
        <FlexBox flexDirection="row" gap={2} mt={2}>
          <Typography variant="caption" align="center" pt={1}>
            <FormattedMessage
              defaultMessage="Referral ID: {referredByAffiliateId}"
              description="Login page Referral ID"
              values={{
                referredByAffiliateId,
              }}
            />
          </Typography>
          <FlexBox display="inline-flex">
            <CharacterCoinStatChip value={3} />
          </FlexBox>
          <Button
            color="primary"
            variant="contained"
            onClick={() => deleteReferredByAffiliateId()}
          >
            <FormattedMessage
              defaultMessage="Remove"
              description="Affiliate Program Page - Remove referral code"
            />
          </Button>
        </FlexBox>
      )}
    </FlexBox>
  );
}
