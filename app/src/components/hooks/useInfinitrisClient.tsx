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
      useLoaderStore.getState().addStep('infinitris-client');
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
          window.infinitris2.setConfig({
            imagesRootUrl: process.env.REACT_APP_IMAGES_ROOT_URL!,
          });
          useLoaderStore.getState().completeStep('infinitris-client');
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
