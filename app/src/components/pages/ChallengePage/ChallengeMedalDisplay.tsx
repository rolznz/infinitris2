import { useState, useEffect } from 'react';
import React from 'react';
import { ReactComponent as GoldMedal } from '@images/medals/gold.svg';

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
    <>
      {[1, 2, 3].map((index) => (
        <GoldMedal key={index} />
      ))}
    </>
  );
}
