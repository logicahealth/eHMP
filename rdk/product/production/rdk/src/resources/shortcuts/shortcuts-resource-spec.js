'use strict';

var shortcuts = require('./shortcuts-resource');

describe('Shortcuts Resource', function() {
    it('tests that getShortcuts() is set up correctly', function() {
        var req = {};
        req.logger = sinon.stub(require('bunyan').createLogger({name: 'shortcuts-resource-spec'}));
        var res = {};
        res.status = function(status) {
            return this;
        }
        res.rdkSend = function(body) {
            expect(body).not.to.be.undefined();
        }
        var shortcutsList = shortcuts.getShortcuts(req, res);
    });
});