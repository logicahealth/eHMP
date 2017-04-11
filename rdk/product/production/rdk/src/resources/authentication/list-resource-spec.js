/*jslint node: true */
'use strict';

var listResource = require('./list-resource');

function buildRequest() {
    var request = {};
    request.app = {
        config: {
            vistaSites: {
                '9E7A': {
                    name: 'PANORAMA',
                    division: '500',
                    host: 'IP_ADDRESS',
                    port: 9210,
                    production: false,
                    accessCode: 'PW',
                    verifyCode: 'PW'
                },
                'C877': {
                    name: 'KODAK',
                    division: '507',
                    host: 'IP_ADDRESS',
                    port: 9210,
                    production: false,
                    accessCode: 'PW',
                    verifyCode: 'PW'
                }
            }
        }
    };
    return request;
}

describe('Facility list', function() {
    it('tests that Facility List returns alphabetically', function(done) {
        var req = buildRequest();
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(result) {
                expect(result.data.items[0].name).not.to.be.undefined();
                expect(result.data.items[0].name).to.equal('KODAK');
                done();
            }
        };
        listResource.get(req, res);
    });

});
