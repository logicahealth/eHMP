'use strict';

var serviceMappings = require('./service-mappings');

describe('Service Mappings', function() {

    function testStatus(title, code) {
        it('`' + title + '` status set to `' + code + '`', function() {
            expect(serviceMappings[title]).to.equal(code);
        });
        it('`' + code + '` status set to `' + title + '`', function() {
            expect(serviceMappings[code]).to.equal(title);
        });
    }

    testStatus('vista', 100);
    testStatus('rdk', 200);
    testStatus('jds', 201);
    testStatus('pjds', 202);
    testStatus('vxsync', 203);
    testStatus('cds', 204);
    testStatus('jbpm', 205);
    testStatus('dod', 300);
    testStatus('jmeadows', 301);
    testStatus('solr', 302);
    testStatus('mvi', 303);
});
