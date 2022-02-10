import useLoaderStore from '@/state/LoaderStore';
import { IClientApi } from 'infinitris2-models';
import { useEffect } from 'react';
import useAppStore from '../../state/AppStore';

declare global {
  interface Window {
    infinitris2: IClientApi;
  }
}

const useInfinitrisClient = () => {
  useEffect(() => {
    (async () => {
      useLoaderStore.getState().increaseSteps();
      try {
        const clientManifest = await (
          await fetch(`${process.env.PUBLIC_URL}/client/manifest.json`, {
            headers: {
              pragma: 'no-cache',
              'cache-control': 'no-cache',
            },
          })
        ).json();
        const clientScript = document.createElement('script');
        clientScript.onload = async () => {
          console.log('Loaded Infinitris Client');
          useLoaderStore.getState().increaseStepsCompleted();
          useAppStore.setState({
            clientApi: window.infinitris2,
          });
        };
        clientScript.src = clientManifest['main.js'];
        clientScript.async = true;
        document.body.appendChild(clientScript);
      } catch (error) {
        console.error('Failed to load infinitris client', error);
      }
    })();
  }, []);
};
export default useInfinitrisClient;
