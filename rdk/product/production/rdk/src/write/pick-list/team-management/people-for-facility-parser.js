'use strict';

var _ = require('lodash');

module.exports.parse = function(item, siteCode) {
    var name = _.get(item, 'name');
    if (name) {
        name = name.replace(',', ', ');
        var title = _.get(item, 'title');
        if (title) {
            name = name + ' (' + title + ')';
        }
    }
    var ien = null;
    var personID = null;
    var uid = _.get(item, 'uid');
    if (uid) {
        ien = uid.split(':')[4];
        personID = siteCode + ';' + ien;
    }

    return {
        'personID': personID,
        'name': name
    };
};
