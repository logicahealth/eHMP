'use strict';

var _ = require('lodash');
var fetch = require('./people-for-facility-fetch-list.js').fetch;
var httpUtil = require('../../../core/rdk').utils.http;


describe('people for facilities fetch list', function() {
    var dummySiteConfig = 'dummySiteConfig';

    var dummyApp = {
        config: {
            jdsServer: {},
            vistaSites: {
                'ABCD': {
                    division: [{
                        id: '100',
                        name: 'ABBBAA'
                    }]
                }
            }
        },
        logger: {
            trace: function() {},
            debug: function() {},
            info: function() {},
            warn: function() {},
            error: function() {},
            fatal: function() {}
        }
    };

    var params = {
        facilityID: '100'
    };

    var people = {
        items: [{
            uid: 'a:b:c:d:uno1'
        }, {
            uid: 'a:b:c:d:dos2'
        }]
    };

    var uno = {
        data: {
            items: [{
                uid: 'a:b:c:d:uno1',
                name: 'lasties,firsties'
            }]
        }
    };

    var dos = {
        data: {
            items: [{
                uid: 'a:b:c:d:dos2',
                name: 'Do,John',
                title: 'Supreme Commander'
            }]
        }
    };

    beforeEach(function() {
        sinon.stub(httpUtil, 'get', function(options, callback) {
            if (_.startsWith(_.get(options, 'url'), 'ehmpusers')) {
                callback(null, people, people);
                return;
            } else if (_.startsWith(_.get(options, 'url'), 'data')) {
                if (_.endsWith(_.get(options, 'url'), 'uno1')) {
                    callback(null, uno, uno);
                    return;
                } else if (_.endsWith(_.get(options, 'url'), 'dos2')) {
                    callback(null, dos, dos);
                    return;
                } else {
                    callback(true);
                    return;
                }
            } else {
                callback(true);
            }
        });
    });

    afterEach(function() {
        httpUtil.get.restore();
    });

    it('returns expected JSON', function(done) {
        fetch(dummyApp.logger, dummySiteConfig, function(err, result) {
            expect(result).to.be.truthy();
            expect(_.get(result[0], 'personID')).to.be('ABCD;uno1');
            expect(_.get(result[0], 'name')).to.be('lasties, firsties');

            expect(_.get(result[1], 'personID')).to.be('ABCD;dos2');
            expect(_.get(result[1], 'name')).to.be('Do, John (Supreme Commander)');
            done();
        }, params, dummyApp.config);
    });
});
