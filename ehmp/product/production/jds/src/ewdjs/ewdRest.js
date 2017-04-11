var ewdrest = require('ewdrest');
var fs = require('fs');

var EWD = {
  restPort: 8081,
  restServer: {
    //key: fs.readFileSync("/usr/ewdjs/ssl/ssl.key"),
    //certificate: fs.readFileSync("/usr/ewdjs/ssl/ssl.crt"),
  },
  service: {
    vpr: {
      module: 'VprRestServer',
      service: 'parse',
      contentType: 'application/json'
    }
  },
  server: {
    ewdjs: {
      host: 'localhost',
      port: 8080,
      ssl: false,
      secretKey: '$keepSecret!',
      accessId: 'JdsClient',
      authenticate: false
    }
  }
};

ewdrest.start(EWD);
