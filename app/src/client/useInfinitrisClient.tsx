import { useEffect } from 'react';
import useAppStore from '../state/AppStore';
import InfinitrisClient from './InfinitrisClient';

declare global {
  interface Window {
      infinitris2: InfinitrisClient;
  }
}

const useInfinitrisClient = () => {
  useEffect(() => {
    (async () => {
      const clientManifest = await (await fetch(`${process.env.PUBLIC_URL}/client/manifest.json`, {
        headers: {
          'pragma': 'no-cache',
          'cache-control': 'no-cache'
        }
      })).json();
      const clientScript = document.createElement('script');
      clientScript.onload = async () => {
        console.log("Loaded Infinitris Client");
        window.infinitris2.launchDemo();
        useAppStore.setState({
          client: window.infinitris2,
        });
      };
      clientScript.src = clientManifest["main.js"];
      clientScript.async = true;
      document.body.appendChild(clientScript);
    })();
  }, []);
};
export default useInfinitrisClient;