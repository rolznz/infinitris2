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

Test webhook functions locally: `yarn serve` then do CURL requests against `http://127.0.0.1:5001/APPNAME/us-central1/webhooks/v1/<webhookName>` and test firestore functions/hooks

# Deploy

Please note that the deployment scripts are in the parent directory.

# Environment variables setup

- key: must be provided by an external service calling one of the infinitris webhooks (e.g. create donation)
- url: base url of infinitris webhooks, used for external services to call our webhooks
- lightning_api_url: external Lightning API used to create invoices
- lightning_api_key: api key to access external Lightning API
- email_user: email address of sender email. Used to send emails to users e.g. login codes
- email_password: password of sender email account

`firebase functions:config:get`

`firebase functions:config:set webhooks.key="SECRET KEY" webhooks.url="https://us-central1-APPNAME.cloudfunctions.net/webhooks" webhooks.lightning_api_url="https://legend.lnbits.com" webhooks.lightning_api_key="your api key" webhooks.email_user="test@email.com" webhooks.email_password="test" webhooks.email_host="smtp.gmail.com"`

## Deploy firebase rules

Open parent directory and run:

yarn firebase:deploy:rules

## Deploy all functions

Open parent directory and run:

yarn firebase:deploy:functions

## Deploy an individual function

Open parent directory and run:

yarn firebase:deploy:functions:onCreateConversion
