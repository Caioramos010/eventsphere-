const path = require('path');

module.exports = {
  webpack: function(config, env) {
    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.allowedHosts = 'all';
      return config;
    };
  }
};
