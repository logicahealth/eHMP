'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var ajv = require('ajv')();
global.expect = require('must');
var fhirToJsonSchemas = require('./');

var testData = [
    {
        schema: {'$ref': 'http://hl7.org/fhir/jsonschema/resources#CommunicationRequest'},
        json: {},
        invalid: true
    },
    {
        schema: {'$ref': 'http://hl7.org/fhir/jsonschema/resources#CommunicationRequest'},
        json: {resourceType: 'CommunicationRequest'}
    },
    {
        schema: {'$ref': 'http://hl7.org/fhir/jsonschema/resources#CommunicationRequest'},
        json: {
            resourceType: 'CommunicationRequest',
            id: '1234',
            sender: { reference: 'http://my.com/fhir/Device/123' },
            recipient: [{ reference: 'Patient/333' }],
            payload: [{
            contentString: 'Hello there!'}],
            requester: { reference: 'Patient/333' },
            status: 'accepted',
            encounter: { reference: 'Encounter/2' },
            scheduledDateTime: '2015-02-12T10:30',
            requestedOn: '2015-02-11T09:06'
        }
    }
];

xdescribe('The FHIR schema generator', function() {

    before(function() {
        var profiles = readFHIRProfiles(path.join(__dirname, 'test-profiles'));
        var schemas = fhirToJsonSchemas(_.initial(profiles), _.last(profiles));
        ajv.addSchema(schemas);
    });

    _.each(testData, function(entry) {

        it('should generate a schema that correctly validates', function() {
            var valid = ajv.validate(entry.schema, entry.json);
            if (entry.invalid) {
                expect(valid).to.be.false();
            } else {
                expect(valid, ajv.errorsText()).to.be.true();
            }
        });

    });

});

function readFHIRProfiles(profilesDirectory) {
    var types = fs.readFileSync(path.join(profilesDirectory, 'profiles-types.json'), {encoding: 'utf8'});
    var resources = fs.readFileSync(path.join(profilesDirectory, 'profiles-resources.json'), {encoding: 'utf8'});
    var valueSets = fs.readFileSync(path.join(profilesDirectory, 'valuesets.json'), {encoding: 'utf8'});
    types = JSON.parse(types);
    resources = JSON.parse(resources);
    valueSets = JSON.parse(valueSets);
    return [types, resources, valueSets];
}
