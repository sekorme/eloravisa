/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'pixabay.com' },
            { protocol: 'https', hostname: 'cdn.pixabay.com' },
            { protocol: 'https', hostname: 'www.gravatar.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 's.gravatar.com' },
            { protocol: 'https', hostname: 'cdn.discordapp.com' },
            { protocol: 'https', hostname: 'i.pravatar.cc' },
            { protocol: 'https', hostname: 'cloud.appwrite.io' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
            { protocol: 'https', hostname: 'i.imgur.com' },
            { protocol: 'https', hostname: 'github.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'logo.clearbit.com' },
            {
                protocol: 'https',
                hostname: 'avatar.vercel.sh',
                pathname: '/**',
            },
        ],
    },
    eslint: {
        // Still ignored: the codebase has many pre-existing style-level lint
        // errors (no-explicit-any etc.). Type errors DO fail the build now.
        ignoreDuringBuilds: true,
    },
    turbopack: {},
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Camera/mic stay allowed for this origin — the consular
                    // and voice interview pages need them.
                    { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/.well-known/apple-developer-merchantid-domain-association',
                destination: '/api/verify',
            },
        ];
    },
};

module.exports = withPWA(nextConfig);
