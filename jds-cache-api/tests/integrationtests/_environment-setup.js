'use strict';

const _ = require('lodash');

// Environment variables all come in as strings,
// so use string defaults and leave parsing integers
// to the places that read the environment variables
_.defaults(process.env, {
    VXSYNC_URL: 'http://IP           ',

    JDS_HTTP_PORT: 'PORT',
    JDS_IP_ADDRESS: 'IP        ',
    JDS_TCP_PORT: 'PORT',
    JDS_USERNAME: 'USER',
    JDS_PASSWORD: 'USER',
    JDS_NAMESPACE: 'JSONVPR',

    PJDS_HTTP_PORT: 'PORT',
    PJDS_IP_ADDRESS: 'IP        ',
    PJDS_TCP_PORT: 'PORT',
    PJDS_USERNAME: 'USER',
    PJDS_PASSWORD: 'USER',
    PJDS_NAMESPACE: 'JSONVPR'
});
