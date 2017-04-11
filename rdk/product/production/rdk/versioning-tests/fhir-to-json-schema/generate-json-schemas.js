'use strict';

var _ = require('lodash');

module.exports = generateJSONSchemas;

function generateJSONSchemas(profiles, valueSets, options) {
    var entries = keyEntriesById(profiles);
    valueSets = keyEntriesById([valueSets]);

    var schemas = [];
    _.each(profiles, function(profile) {
        schemas.push(generateFromProfile(profile, entries, valueSets, options));
    });

    return schemas;
}

function keyEntriesById(profiles) {
    var entries = {};
    _.each(profiles, function(profile) {
        _.each(profile.entry, function(entry) {
            var id = entry.resource.id;
            if (entries[id]) {
                throw new Error('An entry already exists with id ' + id);
            }
            entry.profileId = profile.id;
            entries[id] = entry;
        });
    });
    return entries;
}

function generateFromProfile(profile, entries, valueSets, options) {
    var schema = {
        '$schema': 'http://json-schema.org/schema#',
        id: 'http://hl7.org/fhir/jsonschema/' + profile.id,
        definitions: {}
    };
    _.each(profile.entry, function(entry) {
        if (entry.resource.resourceType === 'StructureDefinition') {
            addDefinitionFromEntry(entry, schema, entries, valueSets, options);
        }
    });
    return schema;
}

function addDefinitionFromEntry(entry, schema, entries, valueSets, options) {
    if (schema.definitions[entry.resource.id]) {
        throw new Error('A schema entry already exists for ' + entry.resource.id);
    }

    var primitiveType = primitiveTypeFromCode(entry.resource.id, entries);
    if (primitiveType) {
        if (_.isObject(primitiveType)) {
            return;
        }
    }

    var definition = {
        id: '#' + entry.resource.id
    };

    if (options.metadata || _.isUndefined(options.metadata)) {
        definition.title = entry.resource.display || entry.resource.name || entry.resource.id;
        if (entry.resource.description) {
            definition.description = entry.resource.description;
        }
        if (entry.resource.notes) {
            definition.description = definition.description ? definition.description + '\n' : '';
            definition.description += 'Notes: ' + entry.resource.notes;
        }
    }

    if (!entry.resource.snapshot) {
        throw new Error(entry.resource.id + ' must have a snapshot; differential-only is not currently supported');
    }

    if (entry.resource.kind === 'resource') {
        definition.properties = {
            resourceType: {type: 'string', pattern: '^' + entry.resource.id + '$'}
        };
        definition.requireds = [['resourceType']];
    }

    if (primitiveType) {
        generatePrimitiveType(definition, entry.resource.snapshot, entries, options);
    } else {
        mapProperties(definition, entry.resource.snapshot, entry, entries, valueSets, options);
        if (!entry.resource.abstract) {
            preventAdditionalProperties(definition, options);
        }
        rewriteRequireds(definition);
    }

// TODO: support fhir_comments if options ask us to

    schema.definitions[entry.resource.id] = definition;
}

function idOf(url, after) {
    after = after || '/StructureDefinition/';
    var index = url.indexOf(after);
    if (index !== -1) {
        return url.substring(index + after.length);
    }
    return url;
}

function generatePrimitiveType(definition, fhirDefinitions, entries, options) {
    _.each(fhirDefinitions.element, function(element) {
        if (!_.endsWith(element.path, '.value')) {
            return;
        }

        var type = determinePrimitiveType(element.type[0], entries);
        if (type.type === 'string' && element.type[0].extension) {
            _.each(element.type[0].extension, function(extension) {
                if (extension.url === 'http://hl7.org/fhir/StructureDefinition/structuredefinition-regex') {
                    type.pattern = extension.valueString;
                }
            });
        }

        _.merge(definition, type);
    });
}

function mapProperties(definition, fhirDefinitions, entry, entries, valueSets, options) {
    var context = [definition];
    _.each(fhirDefinitions.element, function(element) {
        if (!_.contains(element.path, '.')) {
            return;
        }

        // nesting is based on dots in the path
        var segments = element.path.split('.');
        while (segments.length <= context.length) {
            definition = context.pop();
            if (definition['$ref'] && definition.properties) {
                delete definition['$ref'];
            }
            preventAdditionalProperties(definition, options);
            rewriteRequireds(definition);
        }
        while (segments.length > context.length) {
            var propertyKey = segments[context.length];
            parent = _.last(context);
            parent.properties = parent.properties || {};
            parent.properties[propertyKey] = {};
            context.push(parent.properties[propertyKey]);
        }
        definition = _.last(context);
        var parent = context[context.length-2];
        var propertyKey = _.last(segments);

        if (options.metadata || _.isUndefined(options.metadata)) {
            if (element.short) {
                definition.description = element.short;
            }
        }

        var type = mapType(element, entry, entries, options);
        definition = _.merge(definition, type);

        addPrimitiveExtensions(definition, parent, propertyKey, entry, entries, options);
        addEnum(definition, element, valueSets, options);

        if (_.endsWith(element.path, '[x]')) {
            splitWildcardProperty(definition, parent, element, propertyKey, entry, entries, options);
        } else {
            if (definition.type === 'array') {
                context[context.length-1] = definition.items;
            }

            // required
            if (element.min) {
                parent.requireds = parent.requireds || [[]];
                _.each(parent.requireds, function(required) {
                    required.push(propertyKey);
                });
            }
        }
    });
}

function mapType(element, entry, entries, options) {
    var types = [];
    var profileIds = [];
    _.each(element.type, function(elementType) {
        var type = determinePrimitiveType(elementType, entries);
        if (type) {
            addExtendedProperties(type, element);
        } else if (elementType.code) {
            var id = elementType.code;
            if (!_.isEmpty(elementType.profile)) {
                var profileId = idOf(_.first(elementType.profile));
                if (id === 'Reference') {
                    profileIds.push(profileId);
                } else if (extendsFrom(profileId, id, entries)) {
                    id = profileId;
                }
            }
            type = {'$ref': createReference(id, entry.profileId, entries, options)};
        }
        if (type) {
            types.push(type);
        }
    });

    types = _.unique(types, false, function(item) {
        return item.type || item['$ref'];
    });

    var type;
    if (types.length === 1) {
        type = types[0];

        if (profileIds.length > 1) {
            type = {
                allOf: [
                    type,
                    {
                        properties: {
                            reference: {
                                pattern: '\\b(' + profileIds.join('|') + ')/'
                            }
                        }
                    }
                ]
            };
        }
    } else if (types.length > 1) {
        type = {oneOf: types};
    } else {
        type = {type: 'object'};
    }

    setPrefixPropertyIfPresent(element, 'defaultValue', type, 'defaultValue');

// TODO: parse valuesets.json and create an enum if there's a binding with a valueSetReference

    type = maybeConvertToArray(type, element);

    return type;
}

function determinePrimitiveType(elementType, entries) {
    var code = elementType.code;
    if (code) {
        var type = primitiveTypeFromCode(code, entries);
        if (_.isObject(type)) {
            return type;
        }
    }

    if (elementType._code) {
        var primitiveType;
        _.each(elementType._code.extension, function(extension) {
            if (extension.url === 'http://hl7.org/fhir/StructureDefinition/structuredefinition-json-type') {
                primitiveType = {type: extension.valueString};
                return;
            }
        });
        return primitiveType;
    }
}

var primitiveTypes = {
    boolean: {type: 'boolean'},
    integer: {type: 'integer'},
    positiveInt: {type: 'integer', minimum: 1},
    unsignedInt: {type: 'integer', minimum: 0},
    string: {type: 'string'},
    decimal: {type: 'number'},
    uri: {type: 'string', format: 'uri'},
    base64Binary: true,
    xhtml: {type: 'string', format: 'xhtml'},
    instant: true,
    date: true,
    dateTime: true,
    time: true
};

function primitiveTypeFromCode(code, entries) {
    if (primitiveTypes[code]) {
        return primitiveTypes[code];
    }

    var base = entries[code];
    if (base) {
        return primitiveTypeFromCode(base.resource.constrainedType, entries);
    }
}

function extendsFrom(childId, ancestorId, entries) {
    var child = entries[childId];
    if (!child) {
        return;
    }
    do {
        var parentId = child.resource.constrainedType || idOf(child.resource.base || '');
        if (parentId === ancestorId) {
            return true;
        }
        if (!parentId) {
            return false;
        }
        child = entries[parentId];
    } while (child);
    return false;
}

function addExtendedProperties(type, element) {
    switch (type.type) {
    case 'integer':
    case 'number':
        setPrefixPropertyIfPresent(element, 'minValue', type, 'minimum');
        setPrefixPropertyIfPresent(element, 'maxValue', type, 'maximum');
        break;
    case 'string':
        type.minLength = 1;
        if (element.maxLength) {
            type.maxLength = element.maxLength;
        }
        break;
    }
}

function setPrefixPropertyIfPresent(element, prefix, target, propertyKey) {
    _.each(element, function(value, key) {
        if (_.startsWith(key, prefix)) {
            target[propertyKey] = value;
            return false;
        }
    });
}

function createReference(id, profileId, entries, options) {
    var reference = '#' + id;
    if (options.mergeSchemas) {
        return reference;
    }
    var entry = entries[id];
    if (profileId !== entry.profileId) {
        reference = 'http://hl7.org/fhir/jsonschema/' + entry.profileId + reference;
    }
    return reference;
}

function maybeConvertToArray(type, element) {
    if (element.max === '*' || Number(element.max) > 1) {
        type = {type: 'array', items: type};
        if (element.max !== '*') {
            type.maxItems = Number(element.max);
        }
        if (element.min) {
            type.minItems = element.min;
        }
    }
    return type;
}

function addPrimitiveExtensions(definition, parent, propertyKey, entry, entries, options) {
    var type = (definition.type === 'array') ? definition.items.type : definition.type;
    if (isPrimitiveType(type, entries)) {
        propertyKey = '_' + propertyKey;
        var primitiveExtensions = {
            type: 'object',
            properties: {
                id: {type: 'string'},
                extension: {
                    type: 'array',
                    items: {'$ref': createReference('Extension', entry.profileId, entries, options)}
                }
            },
            additionalProperties: false
        };
        if (definition.type === 'array') {
            primitiveExtensions = {
                type: 'array',
                items: {
                    oneOf: [
                        {type: 'null'},
                        primitiveExtensions
                    ]
                }
            };
        }
        parent.properties[propertyKey] = primitiveExtensions;
    }
}

function addEnum(definition, element, valueSets, options) {
    if (element.binding && element.binding.strength === 'required' && element.binding.valueSetReference) {
        var valueSet = valueSets[idOf(element.binding.valueSetReference.reference, '/ValueSet/')];
        if (valueSet && valueSet.resource.codeSystem) {
            definition.enum = _.map(valueSet.resource.codeSystem.concept, 'code');
        }
    }
}

function isPrimitiveType(schemaType, entries) {
    return schemaType === 'number' || primitiveTypeFromCode(schemaType, entries);
}

function splitWildcardProperty(definition, parent, element, propertyKey, entry, entries, options) {
    delete parent.properties[propertyKey];

    var requireds = [];
    var prefix = propertyKey;
    prefix = prefix.substring(0, prefix.length - 3);
    var choices = definition.oneOf || definition.items.oneOf;
    _.each(choices, function(choice, index) {
        var propertyKey = prefix + _.capitalize(choice.type || idOf(choice['$ref'], '#'));
        if (definition.type === 'array') {
            parent.properties[propertyKey] = {type: 'array', items: choice};
        } else {
            parent.properties[propertyKey] = choice;
        }
        addPrimitiveExtensions(choice, parent, propertyKey, entry, entries, options);

        // required choices create a combinatorial explosion of required arrays
        if (element.min && index > 0) {
            parent.requireds = parent.requireds || [[]];
            _.each(parent.requireds, function(required) {
                requireds.push(_.clone(required));
            });
        }
    });

    if (requireds.length) {
        requireds.reverse();
        parent.requireds = parent.requireds.concat(requireds);
        _.each(parent.requireds, function(required, index) {
            var choice = choices[index % choices.length];
            var propertyKey = prefix + _.capitalize(choice.type || idOf(choice['$ref'], '#'));
            required.push(propertyKey);
        });
    }
}

function preventAdditionalProperties(definition, options) {
    if (!definition.properties) {
        return;
    }
    definition.additionalProperties = false;
}

function rewriteRequireds(definition) {
    if (definition.requireds) {
        if (definition.requireds.length === 1) {
            definition.required = definition.requireds[0];
        } else {
            definition.oneOf = [];
            _.each(definition.requireds, function(required) {
                definition.oneOf.push({required: required});
            });
        }
        delete definition.requireds;
    }
}
