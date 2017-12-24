'use strict';

var getPermissionSetsCategories = require('./get-permission-sets-categories');
var _ = require('lodash');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'permission-sets-categories'
}));
var numberCategories = 6;
describe('permission sets categories resource', function() {
    it('tests that the categories are returned', function(done) {
        var req = {
            logger: logger
        };
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(response) {
                expect(_.get(response, 'items.0.label')).not.to.be.undefined();
                expect(_.get(response, 'items.0.value')).not.to.be.undefined();
                expect(_.get(response, 'items.length')).to.be(numberCategories);
                done();
            }
        };
        getPermissionSetsCategories(req, res);
    });
});
