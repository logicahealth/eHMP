'use strict';
var assignRequestSite = require('./assign-request-site');

function createRequest(site, reqUserSessionSite, reqPatientSite, configSite) {
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
        interceptorResults: { patientIdentifiers: { site: reqPatientSite || '' }},
        site: site || ''
    };
}

function reqTestUrl(site, reqUserSessionSite, reqPatientSite, configSite) {
    var next = function() {};
    var res = {};
    var req = createRequest(site, reqUserSessionSite, reqPatientSite, configSite);
    assignRequestSite(req, res, next);
    expect(req.site).to.equal('SITE');
}

describe('Assign Request Site Interceptor', function() {
    it('when request site property is already set', function() {
        reqTestUrl('SITE', null, null, null);
    });
    it('when request site property is set with the user session site property', function() {
        reqTestUrl(null,'SITE', null, null);
    });
    it('when request site property is set with the patient id siteDfn from a pid run through convert-id interceptor', function() {
        reqTestUrl(null, null,'SITE', null);
    });
    it('when request site property is set with the first element of the app config vistaSites property', function() {
        reqTestUrl(null, null, null, 'SITE');
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
