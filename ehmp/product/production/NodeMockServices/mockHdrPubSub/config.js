//Mock HDR Pub/Sub configuration

module.exports = {
    port: 8999,
    logger: {
        name: 'mockHdr',
        streams: [{
            level: 'trace',
            stream: process.stdout
        }, {
            type: 'rotating-file',
            level: 'error',
            period: '1d',
            count: 10,
            path: '/opt/mocks_server/logs/mockHdr.log'
        }]
    },
    saveDataPath: '/opt/mocks_server/mockHdrPubSub',
    domains: ['allergy', 'appointment', 'consult', 'cpt', 'document', 'education', 'exam', 'factor', 'image', 'immunization', 'lab', 'med', 'mh', 'order', 'patient', 'pov', 'problem', 'procedure', 'skin', 'surgery', 'visit', 'vital']
};