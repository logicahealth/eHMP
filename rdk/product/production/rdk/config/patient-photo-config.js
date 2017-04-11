module.exports = {
    name: 'The running configuration',
    externalProtocol: 'http',
    secret: 'mysecuresecretpasscode',
    sessionLength: 900000,
    patientPhotoServer :{
        hostname: 'localhost',
        port: 8889,
        path: 'resource/patientphoto'
    }
};
