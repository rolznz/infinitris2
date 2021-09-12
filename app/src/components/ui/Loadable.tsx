import useLoaderStore from '@/state/LoaderStore';
import { useEffect } from 'react';
import React from 'react';

let loadedKeys: string[] = [];

type LoadableProps = {
  id: string;
  child: (onLoad: () => void) => React.ReactElement;
};

export default function Loadable({ id: key, child }: LoadableProps) {
  const loaderStore = useLoaderStore();
  const increaseSteps = loaderStore.increaseSteps;
  const increaseStepsCompleted = loaderStore.increaseStepsCompleted;

  useEffect(() => {
    if (loadedKeys.indexOf(key) < 0) {
      loadedKeys.push(key);
      increaseSteps();
    }
  }, [increaseSteps]);

  function onLoad() {
    increaseStepsCompleted();
  }

  return <>{child(onLoad)}</>;
}
