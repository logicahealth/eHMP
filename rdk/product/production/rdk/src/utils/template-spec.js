'use strict';

// -----------------------------------------------------------------
// This will test the template.js applyTemplate function.
// ---

var applyTemplate = require('./template').applyTemplate;

describe('lodash template test', function() {
    it('applyTemplate', function() {
        var source = {'name': 'John'};
        var template = 'Hi <%=name%>';
        var errors = [];
        var out = applyTemplate(errors, template, source);
        expect(out).to.eql('Hi John');
    });
});
