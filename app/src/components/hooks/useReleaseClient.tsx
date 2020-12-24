import { useEffect } from 'react';
import useAppStore from '../../state/AppStore';

export default function useReleaseClient() {
  const client = useAppStore((appStore) => appStore.clientApi);
  const releaseClient = client?.releaseClient;
  const launchDemo = client?.launchDemo;

  useEffect(() => {
    return () => {
      if (releaseClient && launchDemo) {
        releaseClient();
        launchDemo();
      }
    };
  }, [releaseClient, launchDemo]);
}
