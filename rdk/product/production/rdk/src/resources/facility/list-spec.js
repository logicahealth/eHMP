'use strict';

var listResource = require('./list');

function buildRequest() {
    var request = {};
    request.app = {
        config: {
            vistaSites: {
                '9E7A': {
                    division: [{
                        id: '500',
                        name: 'PANORAMA'
                    }],
                    host: 'IP        ',
                    port: 9210,
                    production: false,
                    accessCode: 'PW    ',
                    verifyCode: 'PW    !!'
                },
                'C877': {
                    division: [{
                        id: '507',
                        name: 'KODAK'
                    }],
                    host: 'IP        ',
                    port: 9210,
                    production: false,
                    accessCode: 'PW    ',
                    verifyCode: 'PW    !!'
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
