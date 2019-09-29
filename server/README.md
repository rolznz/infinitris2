# Installation
`npm i`

# Build (Development)
`npm run build` (or `npm run watch`)

# Debugging (vscode)
Select the "Debug Server" configuration and press F5.

NB: Currently the core typescript code cannot be debugged through VS Code.
If you have a solution to this, please send a pull request.
For now, you'll need to set breakpoints within dist/bundle.js.

# Run
`npm start`

# Run tests
`npm run build-tests && npm test`

# Generate Documentation
`npm run docs`