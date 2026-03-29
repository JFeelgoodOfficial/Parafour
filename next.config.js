/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.DEPLOY_TARGET === 'github'

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: { unoptimized: true },
  // Only apply static export settings for GitHub Pages
  ...(isGitHubPages && {
    output: 'export',
    trailingSlash: true,
    basePath: '/Parafour',
    assetPrefix: '/Parafour/',
  }),
}

module.exports = nextConfig
