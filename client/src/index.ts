import "url-search-params-polyfill";
import InfinitrisClient from "./client/InfinitrisClient";

if (module.hot) {
    module.hot.accept();
}

/**
 * Export entrypoint
 */
(window as any).infinitris2 = new InfinitrisClient();