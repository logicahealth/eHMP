'use strict';

var rdk = require('../../core/rdk');
var labOrderables = require('./lab-orderables');

function noop() {}

describe('Orderables::Lab', function() {

    var req = {
        app: {
            config: {}
        },
        session: {
            user: {
                site: 'vistaSite'
            }
        },
        logger: {
            debug: noop,
            error: noop
        },
        headers: {}
    };

    var pickListUrl;
    var authToken;

    beforeEach(function() {
        pickListUrl = undefined;
        authToken = undefined;

        sinon.stub(rdk.utils.http, 'get', function(options) {
            pickListUrl = options.url;
            authToken = options.headers ? options.headers.cookie : undefined;
        });
        req.headers = {};
    });

    it('calls the write-pick-list endpoint correctly - no search criteria', function() {
        labOrderables.getOrderables(req, null, noop);
        expect(pickListUrl).to.equal('/resource/write-pick-list?type=lab-order-orderable-items&labType=S.LAB&site=vistaSite');
    });

    it('calls the write-pick-list endpoint correctly - with search criteria', function() {
        labOrderables.getOrderables(req, 'fooBar', noop);
        expect(pickListUrl).to.equal('/resource/write-pick-list?type=lab-order-orderable-items&labType=S.LAB&site=vistaSite&searchString=fooBar');
    });

    it('uses the existing authentication cookie', function() {
        var testToken = 'rdk.sid=my_authentication_token';
        req.headers.cookie = testToken;
        labOrderables.getOrderables(req, 'fooBar', noop);
        expect(authToken).to.equal(testToken);
    });
});
