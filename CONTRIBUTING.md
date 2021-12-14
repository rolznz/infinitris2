This contributing guide is currently a work-in progress.

Please open a github ticket describing how you wish to contribute.

# Translations

Please note the content in the game is highly volatile, but any translations would still be highly appreciated.

1. Add your language shortcode to app/src/internationalization/index.ts
2. Copy app/src/internationalization/lang/en.json to app/src/internationalization/lang/\<your-shortcode\>.json
3. Update the translation file with your language
4. Run `yarn formatjs:compile:all` in the app directory (or add your own yarn script as per the examples)
5. Run the app locally and check the translation
6. Send a pull request :-)

# Server Hosting

Coming Soon

# Development

Basic instructions are here. For further instructions, please see individual project READMEs.
After checking out the repository, please run `yarn install` in the root of the project on a linux terminal (or WSL)

## Models package

The models package is used by all parts of the game (react app, client/server, firebase functions) and must be built first.
`(cd models && yarn build)`

## Client

The client app must be built in order to run the react app.
`(cd client && yarn build)`

## App

// TODO: .env setup
`cd app`
`yarn start`

## Create your own AI

Coming Soon

## Create your own Game Mode

Coming Soon

# Art / Design

Coming Soon

# Music / Sound Effects

Coming Soon
