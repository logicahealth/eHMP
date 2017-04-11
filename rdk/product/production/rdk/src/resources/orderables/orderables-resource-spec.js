'use strict';

var rdk = require('../../core/rdk');
var orderables = require('./orderables');
var labOrderables = require('./lab-orderables');
var radOrderables = require('./rad-orderables');

function noop() {}

describe('Orderables Resource', function() {

    var req;
    var res = {
        status: function() {
            return {
                rdkSend: noop
            };
        }
    };

    beforeEach(function() {
        req = {
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
                error: noop,
                info: noop
            },
            headers: {},
            query: {}
        };
        sinon.spy(labOrderables, 'getOrderables');
        sinon.spy(radOrderables, 'getOrderables');
        sinon.spy(res, 'status');
    });

    it('returns HTTP-400 Bad Request if passed unsupported domains - single domain', function() {
        req.query.domains = 'foo';
        orderables.getOrderables(req, res);
        expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
    });

    it('returns HTTP-400 Bad Request if passed unsupported domains - list of domains', function() {
        req.query.domains = 'foo,bar';
        orderables.getOrderables(req, res);
        expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
    });

    it('returns HTTP-400 Bad Request if passed unsupported domains - list of supported and unsupported domains', function() {
        req.query.domains = 'lab,bar';
        orderables.getOrderables(req, res);
        expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
    });

    it('calls the lab-orderables module for domain query: \'lab\'', function() {
        req.query.domains = 'lab';
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.called).to.be.true();
    });

    it('calls the rad-orderables module for domain query: \'rad\'', function() {
        req.query.domains = 'rad';
        orderables.getOrderables(req, res);
        expect(radOrderables.getOrderables.called).to.be.true();
    });

    it('calls lab-orderables AND rad-orderables modules when domains query is empty (defaults to ALL)', function() {
        req.query.domains = null;
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.called).to.be.true();
        expect(radOrderables.getOrderables.called).to.be.true();

        req.query.domains = undefined;
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.called).to.be.true();
        expect(radOrderables.getOrderables.called).to.be.true();

        req.query.domains = '';
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.called).to.be.true();
        expect(radOrderables.getOrderables.called).to.be.true();
    });

    it('calls the lab-orderables AND rad-orderables modules for domain query: \'lab,rad\'', function() {
        req.query.domains = 'lab,rad';
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.called).to.be.true();
        expect(radOrderables.getOrderables.called).to.be.true();
    });

    it('calls the lab-orderables AND rad-orderables modules with the correct search query string', function() {
        req.query.domains = 'lab,rad';
        req.query.criteria = 'foo';
        orderables.getOrderables(req, res);
        expect(labOrderables.getOrderables.calledWith(req, 'foo')).to.be.true();
        expect(radOrderables.getOrderables.calledWith(req, 'foo')).to.be.true();
    });


});
