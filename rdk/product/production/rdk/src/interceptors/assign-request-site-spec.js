'use strict';
var _ = require('lodash');
var assignRequestSite = require('./assign-request-site');

function createRequest(site, reqUserSessionSite, reqPIDSiteDfnSite, configSite) {
    var reqConfigSite = {};
    reqConfigSite[configSite] = {};
    return {
        logger: {
            debug: function() {
            },
            warn: function() {
            }
        },
        app: {config: {vistaSites: reqConfigSite, interceptors: {assignRequestSite: {disabled: false}}}},
        session: {user: { site:  reqUserSessionSite || ''}},
        interceptorResults: { patientIdentifiers: { siteDfn: reqPIDSiteDfnSite || '' }},
        site: site || ''
    };
}

function reqTestUrl(site, reqUserSessionSite, reqPIDSiteDfnSite, configSite) {
    var next = function() {};
    var res = {};
    var req = createRequest(site, reqUserSessionSite, reqPIDSiteDfnSite, configSite);
    assignRequestSite(req, res, next);
    expect(req.site).to.equal('9E7A');
}

describe('Assign Request Site Interceptor', function() {
    it('when request site property is already set', function() {
        reqTestUrl('9E7A', null, null, null);
    });
    it('when request site property is set with the user session site property', function() {
        reqTestUrl(null,'9E7A', null, null);
    });
    it('when request site property is set with the patient id siteDfn from a pid run through convert-id interceptor', function() {
        reqTestUrl(null, null,'9E7A', null);
    });
    it('when request site property is set with the first element of the app config vistaSites property', function() {
        reqTestUrl(null, null, null, '9E7A');
    });
    it('when request site property is never assigned', function() {
        var next = function() {};
        var res = {
            status: function() {},
            rdkSend: function() {
                expect(req.logger.debug.calledWith(
                    sinon.match(/Request Site Property not assigned/)
                )).to.be.true();
            }
        };
        var req = createRequest(null, null, null, null);
        assignRequestSite(req, res, next);
    });
});
