import * as firebase from '@firebase/testing';

expect.extend({
  async toAllow(testPromise) {
    let pass = false;
    try {
      await firebase.assertSucceeds(testPromise);
      pass = true;
    } catch (err) {
      console.log(err);
    }

    return {
      pass,
      message: () =>
        'Expected Firebase operation to be allowed, but it was denied',
    };
  },
});

expect.extend({
  async toDeny(testPromise) {
    let pass = false;
    try {
      await firebase.assertFails(testPromise);
      pass = true;
    } catch (err) {
      console.log(err);
    }
    return {
      pass,
      message: () =>
        'Expected Firebase operation to be denied, but it was allowed',
    };
  },
});
