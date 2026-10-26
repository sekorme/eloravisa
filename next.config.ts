const { withSentryConfig } = require("@sentry/nextjs/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        // Only hosts images actually come from: the landing hero (unsplash),
        // Google sign-in avatars, and Firebase Storage uploads. Add a host
        // back here if a new image source is introduced.
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
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

// Uploads source maps to Sentry at build time so production stack traces are
// readable. Needs SENTRY_AUTH_TOKEN in the build env (Vercel); without it the
// build still succeeds and just skips the upload.
module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG || "none-m66",
    project: process.env.SENTRY_PROJECT || "eloravisa",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    // Browser events go through this app route, so ad-blockers don't drop them.
    tunnelRoute: "/monitoring",
});
