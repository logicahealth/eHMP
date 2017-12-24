'use strict';
var instructions = require('./instructions');
var _ = require('lodash');

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('Instructions', function() {
    it('gets finstructions successfully', function() {
        var httpStub = sinon.stub(httpUtil, 'get').callsFake(function(config, callback) {
            var httpResponse = {};
            httpResponse.statusCode = 200;
            var body = 'instruction';
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
                    items: ['instruction']
                }
            });
        };
        instructions.getInstructions(req, res);
        httpStub.restore();
    });
});
