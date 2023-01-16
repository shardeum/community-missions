/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  exportTrailingSlash: true,
  exportPathMap: function () {
    return {
      "/": { page: "/" },
    };
  },
};
