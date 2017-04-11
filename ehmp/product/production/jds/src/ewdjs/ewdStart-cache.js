/*
Example EWD.js Startup file for use with Cache on Windows

Notes:

1) Change the database.path value as appropriate for your Cache installation.  Also change the
    password etc if required

2) IMPORTANT!: The cache.node interface module file MUST exist in the primary node_modules directory
of your EWD.js configuration

*/

var ewd = require('ewdjs');

var params = {
      poolSize: 4,
      httpPort: 8080,
	  traceLevel: 5,
      database: {
        type: 'cache',
        path: "/usr/cachesys/mgr",
        //username: "",
        username: "_SYSTEM",
        //password: "",
        password: "SYS",
        //namespace: "VISTA",
        namespace: "JSONVPR",
        debug: "/tmp/debug.log",
        lock: 0,
        debug:1,
        protocol: 2
      },
      management: {
        //password: 'PW             '
        password: 'ehmp'
     },
     webservice: { authenticate: false }
};

ewd.start(params);
