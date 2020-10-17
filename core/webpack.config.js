const buildNumber = require('child_process')
  .execSync('git rev-list HEAD --count')
  .toString();

module.exports = { buildNumber };