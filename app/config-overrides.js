const { addBabelPlugins, override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  ...addBabelPlugins([
    'react-intl',
    {
      idInterpolationPattern: '[sha512:contenthash:base64:6]',
      extractFromFormatMessageCall: true,
      ast: true,
    },
  ]),
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src'),
    ['@components']: path.resolve(__dirname, 'src', 'components'),
    ['@images']: path.resolve(__dirname, 'src', 'images'),
  })
);
