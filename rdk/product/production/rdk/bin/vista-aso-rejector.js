#!/usr/bin/env node
'use strict';

var net = require('net');

var VISTA_ASO_DEFAULT_PORT = PORT;

var server = net.createServer(function(socket) {
    socket.setNoDelay(true);
    console.log('connection received from ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.on('data', function(data) {
        socket.end();
    });
});

server.listen(VISTA_ASO_DEFAULT_PORT, function() {
    var address = server.address();
    console.log(__filename + ' listening on ' + address.address + ':' + address.port);
});
