module.exports = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.sayodatravel.com',
                pathname: '/uploads/**',
            },
        ],
    },
    // images: {
    //     remotePatterns: [
    //         {
    //             protocol: 'http',
    //             hostname: 'localhost',
    //             port: '3001',
    //             pathname: '/uploads/**',
    //         },
    //     ],
    // },
};
