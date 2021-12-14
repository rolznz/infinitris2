This project contains the backend for infinitris - required to manage the accounts and save user data, characters and challenges.

# Install

`yarn install`

# Build

`yarn build`

# Test

First time:

`yarn test:emulator:setup`

Requires two tabs:

`yarn test:emulator:start`

`yarn test`

Sometimes a couple of tests fail when the full collection is run. If so, please try testing the single file.

# Run locally using emulator

Coming soon - execute webhooks and functions from localhost

# Deploy

Please note that the deployment scripts are in the parent directory.

## Deploy firebase rules

yarn firebase:deploy:rules

## Deploy all functions

yarn firebase:deploy:functions

## Deploy an individual function

yarn firebase:deploy:functions:onCreateConversion
