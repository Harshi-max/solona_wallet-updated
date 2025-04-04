// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.ignoreWarnings = [
          {
            module: /node_modules\/superstruct/,
          },
        ];
        return webpackConfig;
      },
    },
  };
  
