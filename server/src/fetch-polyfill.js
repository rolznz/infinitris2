import fetch, {
  // Blob,
  // blobFrom,
  // blobFromSync,
  // File,
  // fileFrom,
  // fileFromSync,
  // FormData,
  Headers,
  Request,
  Response,
} from 'node-fetch';

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.atob = (a) => Buffer.from(a, 'base64').toString('binary');
  globalThis.btoa = (b) => Buffer.from(b).toString('base64');
}

// index.js
import './fetch-polyfill';
