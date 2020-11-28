import 'url-search-params-polyfill';
import InfinitrisClient from '@src/client/InfinitrisClient';

describe('InfinitrisClient', () => {
  it('handles invalid urls', () => {
    const client = new InfinitrisClient();
    const invalidUrlSpy = spyOn<any>(client, '_invalidUrl').and.callThrough();
    client.loadUrl('http://localhost:8080');
    expect(invalidUrlSpy).toHaveBeenCalled();
  });

  it('will launch singleplayer if query parameter is set', () => {
    const client = new InfinitrisClient();
    const singlePlayerSpy = spyOn(
      client,
      'launchSinglePlayer'
    ).and.callThrough();
    client.loadUrl('http://localhost:8080?single-player=true');
    expect(singlePlayerSpy).toHaveBeenCalled();
  });

  it('will launch a network client if query parameter is set', () => {
    const expectedUrl = 'ws://127.0.0.1:9001';
    const client = new InfinitrisClient();
    const networkClientSpy = spyOn(
      client,
      'launchNetworkClient'
    ).and.callThrough();
    client.loadUrl(
      `http://localhost:8080?url=${encodeURIComponent(expectedUrl)}`
    );
    expect(networkClientSpy).toHaveBeenCalledWith(expectedUrl);
  });
});
