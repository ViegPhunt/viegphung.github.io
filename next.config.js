/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    basePath: '/viegphunt.github.io',
    assetPrefix: '/viegphunt.github.io/',
    images: {
        unoptimized: true
    },
    env: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    },
};

module.exports = nextConfig;