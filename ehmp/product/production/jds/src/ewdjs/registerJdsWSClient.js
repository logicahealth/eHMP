var ewdGlobals = require('./node_modules/ewdjs/node_modules/globalsjs');
var interface = require('cache');
var db = new interface.Cache();

// Change these parameters to match your GlobalsDB or Cache system:

var ok = db.open({
  path: '/usr/cachesys/mgr',
  username: '_SYSTEM',
  password: 'SYS',
  namespace: 'JSONVPR'
});

ewdGlobals.init(db);

var ewd = {
  mumps: ewdGlobals
};

var zewd = new ewd.mumps.GlobalNode('%zewd', []);
zewd._setDocument({
  "EWDLiteServiceAccessId": {
    "JdsClient": {
      "secretKey": "$keepSecret!",
      "apps": {
        "JdsPatient": true,
        "JdsRestServer": true
      }
    }
  }
});

db.close();
