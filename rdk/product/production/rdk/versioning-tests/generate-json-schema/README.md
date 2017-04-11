# Generate JSON schema from JSON objects

I wrote this because I couldn't find a module for node.js that generated JSON Schema from a JSON object with plenty of options and without obvious bugs. This is an attempt at satisfying those needs.

## API

This module exports one function:

	function generateSchema(json, [options], [customizer])

The [options](#options) and [customizer](#customizer) parameters are described below.

## Examples

Just pass `generateSchema` an object to generate a schema from:

	var generateSchema = require('generate-json-schema');
	var schema = generateSchema('hello world');
	console.log(JSON.stringify(schema, '\t'));

Which prints:

	{
		"$schema": "http://json-schema.org/draft-04/schema#",
  		"type": "string"
	}

You can also provide options:

	var generateSchema = require('generate-json-schema');
	var options = {
		title: 'My schema',
		includeRequired: true
	}
	var json = [
		{ name: 'Jill' },
		{ name: 'Bob', age: 42 }
	];
	var schema = generateSchema(json, options);
	console.log(JSON.stringify(schema, '\t'));

Which prints:

	{
		"$schema": "http://json-schema.org/draft-04/schema#",
		"title": "My schema",
		"type": "array",
		"items": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string"
				},
				"age": {
					"type": "integer"
				}
			},
			"required": [
				"name"
			]
		}
	}

## <a name="options"></a>The `options` parameter

### General options

* `id`: an ID for the generated schema. Should generally be in the form of a URL, e.g. `http://my.domain.com/my-schema/`. The default is undefined.
* `description`: a description for the generated schema. The default is undefined.
* `title`: title for the generated schema. The default is undefined.
* `verboseMetadata`: boolean for whether to generate `id`, `title` and `description` everywhere in the schema tree. The default is `false`.
* `defaultValues`: boolean for whether to generate default values. The default is `false`.
* `enumValues`: boolean for whether to generate enum restrictions, which include the default value and `null`. The default is `false`.
* `includeRequired`: boolean for whether to include `required` sections in the schema. The default is `false`.

### Array options

* `arrayType`: how to generate schemas for arrays. The default is `"auto"`. Valid options include:
	* `"auto"`: automatically determine the type of arrays.
	* `"empty"`: allow any kind of items in an array.
	* `"same"`: all items in the array use the same schema.
	* `"tuple"`: each entry in the array gets its own schema generated for it.
* `similarityThreshold`: when `arrayType` is `"auto"`, this option is the ratio of similar property keys in each item to consider them similar enough to use the `"same"` arrayType. For instance, if some items have three property keys in common and one of the items has an additional property, for a total of four unique properties, then their ratio would be 3/4 or `0.75`. The default threshold is `0.5`.
* `arrayProperties`: an object containing additional properties to add to array-type schemas. This can include properties like `additionalItems`, `minItems` and `uniqueItems`. The default is undefined.

### Object options

* `objectProperties`: an object containing additional properties to add to object-type schemas. This can include properties like `additionalProperties`, `minProperties` and `maxProperties`. The default is undefined.

### Number options

* `numberProperties`: an object containing additional properties to add to number- and integer-type schemas. This can include properties like `minimum`, `exclusiveMinimum`, `maximum`, `exclusiveMaximum` and `multipleOf`. The default is undefined.

### String options

* `stringProperties`: an object containing additional properties to add to string-type schemas. This can include properties like `minLength` and `maxLength`. The default is undefined.

## <a name="customizer"></a>The `customizer` parameter

If provided, this is a function that allows customizing each node of the generated schema tree. The function takes the following parameters:

* `schema`: the portion of the schema that is currently being generated. It will already be populated, including with the `type` property.
* `json`: the JSON item that is generating this portion of the schema. It may be a part of the original JSON object passed to the `generateSchema` function.
* `path`: an array of path segments describing the path to the current portion of the schema, e.g. `['', 'people', 'items', 'name']`.

The function should make changes to the passed-in `schema` object. Any return values are ignored.

### Example

	var generateSchema = require('generate-json-schema');
	var json = [
		{ name: 'Jill', email: 'jill@example.com' }
	];
	var schema = generateSchema(json, {}, function(schema, json, path) {
		if (path[path.length-1] === 'email') {
			schema.format = 'email';
		}
	});

## Command Line

You can also use this tool from the command line:

	generate-json-schema [options] [json-file]

Or you can pipe the output in and out:

	generate-json-schema [options] < my.json | schema.jsonschema

All the above-described options are supported. Additonally, the following command-line options are supported:

* `whitespace`: The whitespace to format the generated JSON schema with. The default is `"\t"`.
* `outputFile`: The name of the output file if the `json-file` argument is used. The default is the name of the input file with `"schema"` appended to it, so e.g. `my.json` would generate `my.jsonschema`.
