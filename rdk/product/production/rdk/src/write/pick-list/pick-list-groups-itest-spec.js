/*global sinon, describe, it */
'use strict';

var _ = require('lodash');

var pickListGroups = require('./pick-list-groups');

var log = sinon.stub(require('bunyan').createLogger({ name: 'pick-list-groups' }));

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    generalPurposeJdsServer: {
        baseUrl: 'http://IP             '
    },
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost',
    vistaSites: {
        'SITE': {
            'name': 'PANORAMA',
            'environment': 'development',
            'division': '500',
            'host': 'IP        ',
            'localIP': 'IP      ',
            'localAddress': 'localhost',
            'port': PORT,
            'production': false,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'infoButtonOid': '1.3.6.1.4.1.3768'
        },
        'SITE': {
            'name': 'KODAK',
            'environment': 'development',
            'division': '507',
            'host': 'IP        ',
            'localIP': 'IP      ',
            'localAddress': 'localhost',
            'port': PORT,
            'production': false,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'infoButtonOid': '1.3.6.1.4.1.3768'
        }
    }
};

describe('pick-list groups manager', function() {
    it('uses the configurable name to find the orderables pick-list group', function(done) {
        var pickListGroupsConfig = _.cloneDeep(pickListGroups.config);
        var i = _.indexOf(_.pluck(pickListGroupsConfig, 'name'), 'orderables');

        if (i < 0) {
            done();
            return;
        }

        pickListGroupsConfig[i].name = 'dummygroupname';
        pickListGroups._setConfig(pickListGroupsConfig);

        var req = {
            app: {
                config: configuration
            },
            logger: log,
            param: function(x) {
                if (x === 'searchString') {
                    return 'sugar';
                }
                if (x === 'subtype') {
                    return 'lab';
                }
                if (x === 'type') {
                    return 'lab-order-orderable-items';
                }
                if (x === 'site') {
                    return 'SITE';
                }
                if (x === 'labType') {
                    return 'S.LAB';
                }
                return undefined;
            },
            query: {}
        };

        pickListGroups.getPickListGroup(req, 'SITE', 'dummygroupname', function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        });
    });
});
