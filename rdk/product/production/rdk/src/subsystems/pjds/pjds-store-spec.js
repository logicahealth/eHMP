'use strict';

var pjds = require('./pjds-store');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pjds-store'
}));

describe('pJDS  Store', function() {
    it('tests that getResourceConfig() is setup correctly', function() {
        var app = sinon.spy();
        var storename = 'chunky-monkey';
        var resource = pjds.createHealthcheck(storename, app, logger);
        expect(resource.check).to.be.a.function();
        expect(resource.name).to.be.equal('pjds_chunky-monkey');
    });
    it('tests that pjds-store is exported', function() {
        expect(pjds.get).to.be.a.function();
        expect(pjds.put).to.be.a.function();
        expect(pjds.post).to.be.a.function();
        expect(pjds.patch).to.be.a.function();
        expect(pjds.delete).to.be.a.function();
        expect(pjds.parseUid).to.be.a.function();
    });
});
