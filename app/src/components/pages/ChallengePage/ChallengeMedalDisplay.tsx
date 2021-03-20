import { useState, useEffect } from 'react';
import React from 'react';
import { ReactComponent as GoldMedal } from '@images/medals/gold.svg';
import { ReactComponent as SilverMedal } from '@images/medals/silver.svg';
import { ReactComponent as BronzeMedal } from '@images/medals/bronze.svg';
import FlexBox from '@/components/layout/FlexBox';

const medals = [BronzeMedal, SilverMedal, GoldMedal];

interface ChallengeMedalDisplayProps {
  medalIndex: number;
}

export default function ChallengeMedalDisplay({
  medalIndex,
}: ChallengeMedalDisplayProps) {
  const [medalAnimation, setMedalAnimation] = useState(0);
  useEffect(() => {
    if (medalAnimation < medalIndex) {
      setTimeout(() => {
        setMedalAnimation((oldMedalAnimation) => oldMedalAnimation + 1);
      }, 500);
    }
  }, [medalAnimation, medalIndex]);

  return (
    <FlexBox flexDirection="row" height={100} py={2}>
      {medals.map((Medal, index) => {
        return (
          <Medal
            key={index}
            height="100%"
            opacity={medalAnimation > index ? 1 : 0.5}
          />
        );
      })}
    </FlexBox>
  );
}
