module.exports = {
    name: 'Node VIX Mock Services running configuration',
    appName: 'Node VIX Mock Services',
    appPasscode: '',
    port: PORT,
    accessCode: 'USER',
    verifyCode: 'PW    ',
    logger: {
        name: 'vix-mock-server',
        streams: [{
            level: 'trace',
            stream: process.stdout
        }, {
            type: 'rotating-file',
            level: 'info',
            period: '1d',
            count: 10,
            path: '/opt/mocks_server/logs/vix-mock-server.log'
        }]
    }
};
