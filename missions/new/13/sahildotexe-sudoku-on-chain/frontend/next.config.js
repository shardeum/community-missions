/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
 },
 exportTrailingSlash:true,
 exportPathMap: function() {
  return {
    '/':{page: '/'}
  };
 }
}

module.exports = nextConfig
