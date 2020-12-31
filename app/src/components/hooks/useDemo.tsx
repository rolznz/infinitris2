import { useEffect } from 'react';
import useAppStore from '../../state/AppStore';

export default function useDemo() {
  const appStore = useAppStore();
  const { isDemo, setIsDemo } = appStore;
  const client = appStore.clientApi;
  const launchDemo = client?.launchDemo;

  useEffect(() => {
    if (launchDemo && !isDemo) {
      setIsDemo(true);
      launchDemo();
    }
  }, [launchDemo, isDemo, setIsDemo]);
}
