# Generate JSON schema from FHIR Definitions

This tool generates JSON schemas from the version 1.0.x FHIR specification. To function it requires a download of the FHIR Definitions. On the [FHIR Downloads page](https://www.hl7.org/fhir/downloads.html) choose the "JSON: with text" link.

Note that due to limitations of JSON schema, the generated schemas don't reflect all the constraints that FHIR defines. You shouldn't use them as your only validation.

## Command Line

The easiest way to use this tool is to call it via the command line:

	fhir-to-json-schema [options] <profiles-directory> [output-directory]

To see a description of the available options run `fhir-to-json-schema` with no arguments.

## API

You can also generate the schemas programmatically:

	var fhirToJsonSchema = require('fhir-to-json-schema');

	var profiles = ... // load and parse the files into the profiles array
	var valueSets = ... // load and parse the valuesets.json file
	var options = {
		metadata: true,
		mergeSchemas: false
	};
	fhirToJsonSchema(profiles, valueSets, options);

The `profiles` parameter is an array of JSON objects in the FHIR structure definition format, such as you would get from loading the `profiles-*.json` files in the above-mentioned download.

The `valueSets` parameter is an optional JSON object containing value sets, also in the FHIR structure definition format, such as you would get from loading `valuesets.json` in the above-mentioned download.

The `options` parameter is optional. It can have the following members:

* `metadata`: whether to generate metadata like "title" and "description". Default is `true`.
* `mergeSchemas`: whether to merge the generated schemas into one. Default is `false`.
