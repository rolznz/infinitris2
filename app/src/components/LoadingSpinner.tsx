import React from 'react';
import Loader from 'react-loader-spinner';

const LoadingSpinner = ({ type }: { type: 'Rings' | 'BallTriangle' }) => (
  <Loader type={type} color="#00BFFF33" height={100} width={100} />
);
export default LoadingSpinner;
