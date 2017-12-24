//Mock DAS configuration

module.exports = {
    logger: {
        name: 'mockDas',
        streams: [{
            type: 'rotating-file',
            level: 'info',
            period: '1d',
            count: 10,
            path: '/opt/mocks_server/logs/mockDas.log'
        }]
    },
};
