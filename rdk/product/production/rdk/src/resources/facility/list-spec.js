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
                    host: '10.2.2.101',
                    port: 9210,
                    production: false,
                    accessCode: 'pu1234',
                    verifyCode: 'pu1234!!'
                },
                'C877': {
                    division: [{
                        id: '507',
                        name: 'KODAK'
                    }],
                    host: '10.2.2.102',
                    port: 9210,
                    production: false,
                    accessCode: 'pu1234',
                    verifyCode: 'pu1234!!'
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
