#!/usr/bin/env node
'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var generateJsonSchema = require('./generate-json-schema');

var jsonText = '';
var whitespace;
var processed = false;

program
    .version(require('./package').version)
    .option('--id <id>', 'An ID for the generated schema. Should generally be in the form of a URL, e.g. `http://my.domain.com/my-schema/`.')
    .option('--description <description>', 'A description for the generated schema.')
    .option('--title <title>', 'A title for the generated schema.')
    .option('-v, --verboseMetadata', 'Generate `id`, `title` and `description` everywhere in the schema tree.')
    .option('-d, --defaultValues', 'Generate default values.')
    .option('-e, --enumValues', 'Generate enum restrictions, which include the default value and `null`.')
    .option('-r, --includeRequired', 'Include `required` sections in the schema.')
    .option('--arrayType <type>', 'how to generate schemas for arrays. The default is "auto". Valid options include:\n"auto": automatically determine the type of arrays.\n"empty": allow any kind of items in an array.\n"same": all items in the array use the same schema.\n"tuple": each entry in the array gets its own schema generated for it.', /^(auto|empty|same|tuple)$/i, 'auto')
    .option('--similarityThreshold <similarityThreshold>', 'when `arrayType` is "auto", this option is the ratio of similar property keys in each item to consider them similar enough to use the "same" arrayType. For instance, if some items have three property keys in common and one of the items has an additional property, for a total of four unique properties, then their ratio would be 3/4 or 0.75. The default threshold is 0.5.')
    .option('--arrayProperties <arrayProperties>', 'A JSON object containing additional properties to add to array-type schemas. This can include properties like `additionalItems`, `minItems` and `uniqueItems`.', JSON.parse)
    .option('--objectProperties <objectProperties>', 'A JSON object containing additional properties to add to object-type schemas. This can include properties like `additionalProperties`, `minProperties` and `maxProperties`.', JSON.parse)
    .option('--numberProperties <numberProperties>', 'A JSON object containing additional properties to add to number- and integer-type schemas. This can include properties like `minimum`, `exclusiveMinimum`, `maximum`, `exclusiveMaximum` and `multipleOf`.', JSON.parse)
    .option('--stringProperties <stringProperties>', 'A JSON object containing additional properties to add to string-type schemas. This can include properties like `minLength` and `maxLength`.', JSON.parse)
    .option('--whitespace <whitespace>', 'The whitespace to format the generated JSON schema with. The default is `"\\t"`.')
    .option('--outputFile <outputFile>', 'The name of the output file if the `json-file` argument is used. The default is the name of the input file with "schema" appended to it, so e.g. my.json would generate my.jsonschema.')
    .arguments('[json-file]')
    .description('Generate a JSON schema that successfully validates the given JSON. If the json-file parameter is not supplied, it reads the JSON from stdin.')
    .action(function(jsonFile) {
        whitespace = program.whitespace || '\t';
        if (jsonFile) {
            jsonText = fs.readFileSync(jsonFile, {encoding: 'utf8'});
            var json = JSON.parse(jsonText);
            var schema = generateJsonSchema(json, program);
            var schemaText = JSON.stringify(schema, null, whitespace);
            var outputFile = program.outputFile || jsonFile + 'schema';
            fs.writeFileSync(outputFile, schemaText);
            processed = true;
        }
    })
    .parse(process.argv);

if (processed) {
    return;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    jsonText += chunk;
});

process.stdin.on('end', function() {
    var json;
    try {
        json = JSON.parse(jsonText);
    } catch (e) {
        json = jsonText;
    }
    var schema = generateJsonSchema(json, program);
    var schemaText = JSON.stringify(schema, null, whitespace);
    console.log(schemaText);
});
