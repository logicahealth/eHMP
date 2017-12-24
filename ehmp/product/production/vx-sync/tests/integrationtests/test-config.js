var nconf = require('nconf');

require('../../env-setup');

nconf
    .argv()
    .env()
    .file({
        file: global.VX_ROOT + 'worker-config.json'
    });

var vx_sync_ip = nconf.get('VXSYNC_IP');
var vx_sync_port = PORT;

module.exports.vxsyncIP = vx_sync_ip;
module.exports.vxsyncPort = vx_sync_port;
