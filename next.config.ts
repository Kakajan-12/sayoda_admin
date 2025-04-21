// next.config.js
module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '162.0.211.12',
                port: '3001',
                pathname: '/**',
            },
        ],
    },
};
