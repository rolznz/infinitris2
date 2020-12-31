const { addBabelPlugins, override } = require('customize-cra');

module.exports = override(
  ...addBabelPlugins([
    'react-intl',
    {
      idInterpolationPattern: '[sha512:contenthash:base64:6]',
      extractFromFormatMessageCall: true,
      ast: true,
    },
  ])
);
