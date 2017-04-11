'use strict';

var resource = require('./orders-sig-code-encryptor');

describe('write-back signature code encryption', function() {
    var sigCode = 'testSigCode';
    var encrypedSigCode = resource.encryptSig(sigCode);

    it('tests that valid encrypted code is returned', function() {
        expect(encrypedSigCode).to.not.be.undefined();
    });

});
