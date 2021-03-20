import React from "react";
import StarRatingComponent from "react-star-rating-component";

interface ChallengeRatingDisplayProps() {
  
}

export default function ChallengeRatingDisplay()
{
  return <div style={{ fontSize: 96 }}>
    <StarRatingComponent
      name="challenge-score"
      editing={false}
      starCount={5}
      value={}
    />
</div>;
}