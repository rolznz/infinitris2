import 'url-search-params-polyfill';
import ClientApi from './api/ClientApi';

declare global {
  interface Window {
    infinitris2: ClientApi;
  }
}

if (module.hot) {
  module.hot.accept();
}

/**
 * Export entrypoint
 */
window.infinitris2 = new ClientApi();
