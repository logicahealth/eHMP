module.exports = {
    name: 'The running configuration',
    externalProtocol: 'http',
    secret: 'PW',
    sessionLength: 900000,
    patientPhotoServer :{
        hostname: 'localhost',
        port: PORT,
        path: 'resource/patientphoto'
    }
};
