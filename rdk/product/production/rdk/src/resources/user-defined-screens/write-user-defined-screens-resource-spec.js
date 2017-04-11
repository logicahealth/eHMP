'use strict';

var userdefinedscreensResource = require('./write-user-defined-screens-resource');

describe('Write User Defined Screens Get Resource', function() {
    describe('call function saveUserDefinedScreens', function() {
        it('tests that getResourceConfig() is setup correctly', function() {
            var resources = userdefinedscreensResource.getResourceConfig();

            expect(resources[0].name).to.equal('write-user-defined-screens');
            expect(resources[0].path).to.equal('');
            expect(resources[0].post).not.to.be.undefined();
            expect(resources[0].interceptors).to.eql({
                operationalDataCheck: false,
                synchronize: false
            });
            expect(resources[0].requiredPermissions).to.eql(['access-general-ehmp']);

            expect(resources[1].name).to.equal('write-user-defined-screens-copy');
            expect(resources[1].path).to.equal('/copy');
            expect(resources[1].post).not.to.be.undefined();
            expect(resources[1].interceptors).to.eql({
                operationalDataCheck: false,
                synchronize: false
            });
            expect(resources[1].requiredPermissions).to.eql(['access-general-ehmp']);

            expect(resources[2].name).to.equal('write-user-defined-screens');
            expect(resources[2].path).to.equal('');
            expect(resources[2].put).not.to.be.undefined();
            expect(resources[2].interceptors).to.eql({
                operationalDataCheck: false,
                synchronize: false
            });
            expect(resources[2].requiredPermissions).to.eql(['access-general-ehmp']);
        });
    });
});
