/** @type {import('next').NextConfig} */

const nextConfig = { 
    images:{
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
        },



       
    ]

        
    }
}
module.exports = nextConfig;
