#!/usr/bin/env node
'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var fhirToJsonSchema = require('./index');

var profilesDirectory, outputDirectory;

program
    .version(require('./package').version)
    .option('-m --mergeSchemas', 'Merge the resulting schemas into a single file.')
    .option('-n --noMetadata', 'Don\'t generate metadata like title and description.')
    .arguments('<profiles-directory> [output-directory]')
    .description('Convert profiles-types.json, profiles-resources.json and valuesets.json from the given profiles-directory to JSON schemas. If the output-directory is not provided the schemas are placed in the profiles-directory.')
    .action(function(profilesDir, outputDir) {
        profilesDirectory = profilesDir;
        outputDirectory = outputDir || profilesDirectory;
    })
    .parse(process.argv);

if (!profilesDirectory) {
    program.help();
    return;
}

var options = {
    mergeSchemas: program.mergeSchemas,
    metadata: !program.noMetadata
};

var profiles = readFHIRProfiles(profilesDirectory);
var valueSets = _.last(profiles);
profiles = _.initial(profiles);

var schemas = fhirToJsonSchema(profiles, valueSets, options);

_.each(schemas, function(schema, index) {
    var fileName = options.mergeSchemas ? 'FHIR.jsonschema' : profiles[index].id + '.jsonschema';
    var content = JSON.stringify(schema, null, '\t');
    fs.writeFileSync(path.join(outputDirectory, fileName), content);
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
