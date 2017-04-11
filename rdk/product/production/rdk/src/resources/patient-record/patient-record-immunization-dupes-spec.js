
var PatientImmunizationDupes = require('./patient-record-immunization-dupes');

var vistaSites = {
    C877: {
        name: 'KODAK',
                division: [{
                    id: "500",
                    name: "PANORAMA"
                }],
                host: '10.2.2.102',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A1': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A2': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A3': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A4': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A5': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A6': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A7': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A8': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A9': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A10': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A11': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A12': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A13': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    },
    '9E7A14': {
        name: 'PANORAMA',
                division: [{
                    id: "507",
                    name: "KODAK"
                }],
                host: '10.2.2.101',
                localIP: '10.2.2.1',
                localAddress: 'localhost',
                port: 9210,
                production: false,
                accessCode: 'ep1234',
                verifyCode: 'ep1234!!',
        infoButtonOid: '1.3.6.1.4.1.3768'
    }
};

var fluDOD = {
    'administeredDateTime': '20001204103149',
    'facilityCode': 'DOD',
    'name': 'INFLUENZA'
};

var rubellaVista = {
    'administeredDateTime': '201531204103114',
    'facilityCode': '500',
    'name': 'RUBELLA'
};

var mumpsSecondary = {
    'administeredDateTime': '20100404105506',
    'facilityCode': '561',
    'name': 'MUMPS'
};

describe('Verify duplicates are removed', function() {

    it('Correct immunization records are obtained with no duplication, all have valid dates', function() {

        var input = [fluDOD, rubellaVista, mumpsSecondary];
        var expectedOutput = [fluDOD, rubellaVista, mumpsSecondary];
        PatientImmunizationDupes.removeDuplicateImmunizations(vistaSites, input);

        expect(expectedOutput.length).to.be.equal(input.length);
    });

    it('Correct immunization records are obtained with no duplication, all have valid dates', function() {
        var input = [fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary, fluDOD, rubellaVista, mumpsSecondary];
        var expectedOutput = [fluDOD, rubellaVista, mumpsSecondary];
        PatientImmunizationDupes.removeDuplicateImmunizations(vistaSites, input);
        expect(expectedOutput.length).to.be.equal(3);
    });


});
