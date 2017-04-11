/* jshint -W016 */
'use strict';

var uuid = require('node-uuid');

function generateUUID() {
    return uuid.v4();
}

function pidFromUid(uid) {
    var regex = /[^:]+:[^:]+:[^:]+:([^:]+:[^:]+):[^:]*/;
    var match = uid.match(regex);

    if (!match || match.length < 2) {
        throw 'Invalid uid';
    }


    return match[1].replace(/:/, ';');
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

module.exports.isEmpty = isEmpty;
module.exports.generateUUID = generateUUID;
module.exports.pidFromUid = pidFromUid;
