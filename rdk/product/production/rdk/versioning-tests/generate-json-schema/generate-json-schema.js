'use strict';

var _ = require('lodash');

var ArrayType = {
    empty: 'empty',
    same: 'same',
    tuple: 'tuple'
};

module.exports = generateSchema;
module.exports.ArrayType = ArrayType;

function generateSchema(json, options, customizer) {
    options = _.extend({}, options);
    options.customizer = customizer;
    var schema = _.extend({
        $schema: 'http://json-schema.org/draft-04/schema#'
    }, _.pick(options, 'description', 'id', 'title'));
    if (json) {
        var path = [options.id || ''];
        if (_.endsWith(path[0], '/')) {
            path[0] = path[0].substring(0, path[0].length-1);
        }
        generateSchemaPortion(json, schema, options, path);
if (options.useReferences) {
// FUTURE-TODO: create a definitions section, maybe combine similar definitions, replace with $refs
}
    }
    return schema;
}

function generateSchemaPortion(json, schema, options, path) {
    schema.type = determineJsonType(json);
    if (schema.type === 'array') {
        generateArraySchema(json, schema, options, path);
    } else if (schema.type === 'object') {
        generateObjectSchema(json, schema, options, path);
    } else {
        generatePrimitiveSchema(json, schema, options, path);
    }

    if (options.verboseMetadata) {
        if (!schema.title) {
            if (path.length === 1) {
                schema.title = 'Root schema';
            } else {
                schema.title = _.rest(path).join('/') + ' schema';
            }
        }
        schema.description = schema.description || 'TODO: a description of this schema.';
        schema.id = schema.id || (path.join('/') + '/');
    }

    if (options.customizer) {
        options.customizer(schema, json, path);
    }

    return schema;
}

function generateArraySchema(array, schema, options, path) {
    var arrayType = determineArrayType(array, options);
    if (arrayType.type === ArrayType.tuple) {
        schema.items = [];
        _.each(array, function(item, i) {
            schema.items.push(generateSchemaPortion(item, {}, options, path.concat([i])));
        });
        if (options.includeRequired) {
            schema.required = _.keys(array);
        }
    } else if (arrayType.type === ArrayType.same) {
        schema.items = generateSchemaPortion(arrayType.standard, {}, options, path.concat(['items']));
        _.merge(schema.items, arrayType.schema, function(a, b, key) {
            if (key === 'required') {
                return b;
            }
            return undefined;
        });
    } else {
        schema.items = {};
    }

    _.merge(schema, options.arrayProperties);
}

function generateObjectSchema(object, schema, options, path) {
    var required = _.keys(object);
    if (options.includeRequired) {
        if (required.length) {
            schema.required = required;
        }
    }
    schema.properties = {};
    _.each(object, function(value, key) {
        schema.properties[key] = generateSchemaPortion(value, {}, options, path.concat([key]));
    });

    _.merge(schema, options.objectProperties);
}

function generatePrimitiveSchema(item, schema, options) {
    switch (schema.type) {
    case 'string':
        _.merge(schema, options.stringProperties);
        break;
    case 'integer':
    case 'number':
        _.merge(schema, options.numberProperties);
        break;
    }
    if (options.defaultValues) {
        schema.default = item;
    }
    if (options.enumValues) {
        schema.enum = _.union([item], [null]);
    }
}

function determineJsonType(item) {
    if (_.isArray(item)) {
        return 'array';
    } else if (_.isString(item)) {
        return 'string';
    } else if (_.isBoolean(item)) {
        return 'boolean';
    } else if (_.isNumber(item)) {
        if ((item % 1) === 0) {
            return 'integer';
        }
        return 'number';
    } else if (_.isNull(item)) {
        return 'null';
    } else if (_.isObject(item)) {
        return 'object';
    }
    return undefined;
}

function determineArrayType(array, options) {
    if (!array.length || options.arrayType === ArrayType.empty) {
        return {type: ArrayType.empty};
    }
    var type = ArrayType[options.arrayType];
    if (!type) {
        type = checkDisparateTypes(array);
    }
    if (!type || type === ArrayType.same) {
        return gatherSimilarTypeInfo(array, type, options);
    }
    return {type: type};
}

function checkDisparateTypes(array) {
    var arrayType;
    var previousType;
    _.each(array, function(item) {
        var itemType = determineJsonType(item);
        if (previousType && itemType !== previousType) {
            arrayType = ArrayType.tuple;
            return false;
        }
        previousType = itemType;
    });
    return arrayType;
}

function gatherSimilarTypeInfo(array, type, options) {
    var standard = _.clone(_.last(array));
    var schema = {};

    if (determineJsonType(standard) === 'object') {
        var itemKeys = [];
        _.each(array, function(item) {
            itemKeys.push(_.keys(item));
        });

        var allKeys = _.union.apply(null, itemKeys);
        var similarityThreshold = options.similarityThreshold || 0.5;
        _.each(itemKeys, function(keys, i) {
            if (!type && (keys.length / allKeys.length) < similarityThreshold) {
                type = ArrayType.tuple;
                return false;
            }
            standard = _.extend(standard, array[i]);
        });

        if (options.includeRequired && type !== ArrayType.tuple) {
            var required = _.intersection.apply(null, itemKeys);
            if (required.length) {
                schema.required = required;
            }
        }
    } else {
        if (options.defaultValues) {
            schema.default = standard;
        }
        if (options.enumValues) {
            schema.enum = _.union(array, [null]);
        }
    }

    return {
        type: type || ArrayType.same,
        standard: standard,
        schema: schema
    };
}
