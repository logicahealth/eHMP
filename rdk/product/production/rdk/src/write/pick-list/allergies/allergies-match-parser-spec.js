'use strict';

var bunyan = require('bunyan');
var allergiesMatchParser = require('./allergies-match-parser');

describe('allergies-match-parser', function() {
    describe('createAllergen', function() {
        var logger;
        beforeEach(function() {
            logger = sinon.stub(bunyan.createLogger({name: 'allergies-match-parser-spec'}));
        });
        it('should include the final comma and exclude the source when parsing the file', function() {
            var row = '111^DIATRIZOATE/IODIPAMIDE^PSNDF(50.6,"B")^D^3';
            var fields = row.split('^');
            var allergen = allergiesMatchParser._createAllergen(logger, fields);
            expect(allergen.file).to.equal('PSNDF(50.6,');
        });
        it('should handle PSDRUG as a special case when parsing the file', function() {
            var row = '111^DIATRIZOATE/IODIPAMIDE^PSDRUG(???)^D^3';
            var fields = row.split('^');
            var allergen = allergiesMatchParser._createAllergen(logger, fields);
            expect(allergen.file).to.equal('PSDRUG(');
        });
    });
});
