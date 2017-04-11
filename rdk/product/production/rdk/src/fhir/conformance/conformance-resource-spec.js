'use strict';
var conformance = require('./conformance-resource');
function noop() {}

describe('Conformance FHIR Resource', function() {
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
            query: {resource: ''},
            param: function () {
                return this.query.resource;
            }
        };
        sinon.spy(res, 'status');
    });

    it('Verifies correct resource name and path', function() {
        var config = conformance.getResourceConfig()[0];
        expect(config.name).to.eql('fhir-conformance-metadata');
        expect(config.path).to.eql('');
    });

    it('Bundles results correctly', function() {
        var out = conformance.packageRequestedStatements(req);
        expect(out.resourceType).to.eql('Conformance');
        expect(out.id).not.to.be.undefined();
        expect(out.url).to.eql('http://hl7.org/fhir/Conformance/ehmp');
        expect(out.name).to.eql('EHMP FHIR Conformance Statement');
        expect(out.rest[0].mode).to.eql('server');
        expect(out.rest[0].documentation).to.eql('A conformance statement');
        expect(out.rest[0].resource.length).to.above(0);
    });
});
