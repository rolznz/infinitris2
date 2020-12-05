import 'url-search-params-polyfill';
import InfinitrisApi from './api/InfinitrisApi';

declare global {
  interface Window {
    infinitris2: InfinitrisApi;
  }
}

if (module.hot) {
  module.hot.accept();
}

/**
 * Export entrypoint
 */
window.infinitris2 = new InfinitrisApi();
