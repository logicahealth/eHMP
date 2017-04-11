'use strict';

require('../../../env-setup');

var ErrorProcessor = require(global.VX_ERROR_PROCESSING + 'error-processor');

describe('error-finder.js', function() {
    describe('buildFilter()', function() {
        it('verify no job types', function() {
            var filter = 'eq("severity","transient-exception"),eq("classification","job")';

            expect(ErrorProcessor._buildFilter()).toEqual(filter);
            expect(ErrorProcessor._buildFilter(null)).toEqual(filter);
            expect(ErrorProcessor._buildFilter([])).toEqual(filter);
        });

        it('verify with job type', function() {
            var filter = 'eq("severity","transient-exception"),eq("classification","job"),eq("jobType","test")';
            expect(ErrorProcessor._buildFilter('test')).toEqual(filter);
        });
    });
});

