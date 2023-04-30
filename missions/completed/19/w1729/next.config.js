const path = require("path");

module.exports = {
  // basePath: "/zokrates-nextjs-demo",
  // assetPrefix: "/zokrates-nextjs-demo/",
  // reactStrictMode: true,
  // experimental: {
  //   images: {
  //     unoptimized: true,
  //   },
  // },
  webpack: function (config) {
    config.experiments = { syncWebAssembly: true };
    config.ignoreWarnings = [
      {
        module: /zokrates-js/,
      },
    ];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};
