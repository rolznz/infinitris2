import useLoaderStore from '@/state/LoaderStore';
import { useEffect } from 'react';
import React from 'react';

type LoadableProps = {
  child: (onLoad: () => void) => React.ReactElement;
};

export default function Loadable(props: LoadableProps) {
  const loaderStore = useLoaderStore();
  const increaseSteps = loaderStore.increaseSteps;
  const increaseStepsCompleted = loaderStore.increaseStepsCompleted;

  useEffect(() => {
    increaseSteps();
  }, [increaseSteps]);

  function onLoad() {
    increaseStepsCompleted();
  }

  return <>{props.child(onLoad)}</>;
}
