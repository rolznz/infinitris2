import React from 'react';
import { ReactComponent as GoldMedal } from '@images/medals/gold.svg';
import { ReactComponent as SilverMedal } from '@images/medals/silver.svg';
import { ReactComponent as BronzeMedal } from '@images/medals/bronze.svg';
import FlexBox from '@/components/ui/FlexBox';

const medals = [BronzeMedal, SilverMedal, GoldMedal];

interface ChallengeMedalDisplayProps {
  medalIndex: number;
  size: number;
}

export default function ChallengeMedalDisplay({
  medalIndex,
  size,
}: ChallengeMedalDisplayProps) {
  // const [medalAnimation, setMedalAnimation] = useState(0);
  // useEffect(() => {
  //   if (medalAnimation < medalIndex) {
  //     setTimeout(() => {
  //       setMedalAnimation((oldMedalAnimation) => oldMedalAnimation + 1);
  //     }, 500);
  //   }
  // }, [medalAnimation, medalIndex]);

  //console.log('ChallengeMedalDisplay medal ' + medalIndex);

  return (
    <FlexBox flexDirection="row" height={size} position="absolute">
      {medals.map((Medal, index) => {
        return index === medalIndex - 1 ? (
          <Medal
            key={index}
            height="100%"
            //opacity={medalAnimation > index ? 1 : 0.5}
          />
        ) : null;
      })}
    </FlexBox>
  );
}
