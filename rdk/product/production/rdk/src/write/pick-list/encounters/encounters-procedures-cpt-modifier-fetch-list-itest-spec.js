'use strict';

var fetchList = require('./encounters-procedures-cpt-modifier-fetch-list').fetch;

var log = sinon.stub(require('bunyan').createLogger({
    name: 'cpt-modifier-fetch-list'
}));

var configuration = {
    environment: 'development',
    context: 'OR CPRS GUI CHART',
    host: 'IP        ',
    port: PORT,
    accessCode: 'USER  ',
    verifyCode: 'PW      ',
    localIP: 'IP      ',
    localAddress: 'localhost'
};

describe('cpt-modifier resource integration test', function() {
    it('can call the getEncountersProceduresCptModifier RPC without errors', function (done) {
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.falsy();
            expect(result).to.exist();
            done();
        }, {cpt: '99202', visitDate: '20150617'});
    });
    it('will receive an error when cpt parameter is missing', function(done){
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).not.to.exist();
            done();
        });
    });
    it('will NOT return data', function(done){
        this.timeout(8000);
        fetchList(log, configuration, function (err, result) {
            expect(err).to.be.truthy();
            expect(result).not.to.exist();
            done();
        }, {cpt: '1', visitDate: '20150617'});
    });
});
