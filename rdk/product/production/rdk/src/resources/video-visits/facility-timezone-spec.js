'use strict';
var facilityTimezone = require('./facility-timezone');
var _ = require('lodash');

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('Facility Timezone', function() {
    it('gets facility timezone', function() {
        var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = [1, 2, 3, 4];
            callback(null, httpResponse, body);
        });
        var req = {
            audit: {
                dataDomain: null,
                logCategory: null
            },
            param: function(param) {
                return null;
            }
        };
        _.set(req, 'session.user.division', 'SITE');
        _.set(req, 'app.config.videoVisit.vvService', {});
        var res = {};
        res.rdkSend = function(body) {
            expect(body).to.eql({
                data: {
                    items: [1, 2, 3, 4]
                }
            });
        };
        facilityTimezone.getFacilityTimezone(req, res);
        httpStub.restore();
    });
});
