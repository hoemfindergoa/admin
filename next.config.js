/** @type {import('next').NextConfig} */

const nextConfig = { 
    images:{
        minimumCacheTTL: 31536000,
        remotePatterns:[{
            hostname:"avatars.githubusercontent.com",
            protocol:"https",
        },
        {
            hostname:"lh3.googleusercontent.com",
            protocol:"https",
        },
        {
            hostname:"scontent-lhr6-2.cdninstagram.com",
            protocol:"https",
        },
        {
            protocol: "https",
            hostname: "unsplash.com",
        },
        {
            protocol: "https",
            hostname: "images.unsplash.com",
        },
        {
            protocol: "https",
            hostname: "owerrlaobwdowecvbfgk.supabase.co",
        },
        {
            protocol: "https",
            hostname: "gist.github.com",
        }]
    },
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|png|webp|avif|ico|mp4|webm|woff|woff2|otf|ttf)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            },
        ];
    }
}
module.exports = nextConfig;
