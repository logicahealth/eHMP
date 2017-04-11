'use strict';

var _ = require('lodash');
global.expect = require('must');
var generateSchema = require('./generate-json-schema');

describe('The JSON schema generator', function() {

    var testData = [
        {
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#'
            }
        },

        {
            json: 'hello world',
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'string'
            }
        },

        {
            json: {bill: true, nill: null},
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                properties: {
                    bill: {
                        type: 'boolean'
                    },
                    nill: {
                        type: 'null'
                    }
                }
            }
        },

        {
            options: {
                description: 'an array of strings'
            },
            json: ['one', 'two'],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'an array of strings',
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        },

        {
            options: {
                description: 'a nested array of strings'
            },
            json: [['one', 'two'], ['three', 'four']],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a nested array of strings',
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            }
        },

        {
            options: {
                description: 'a specified arrayType',
                arrayType: 'tuple',
                includeRequired: true
            },
            json: ['one', 'two'],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a specified arrayType',
                type: 'array',
                items: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'string'
                    }
                ],
                required: ['0', '1']
            }
        },

        {
            options: {
                description: 'an arrayType of "empty"',
                arrayType: 'empty'
            },
            json: ['one', 'two'],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'an arrayType of "empty"',
                type: 'array',
                items: {}
            }
        },

        {
            options: {
                description: 'an empty array'
            },
            json: [],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'an empty array',
                type: 'array',
                items: {}
            }
        },

        {
            options: {
                description: 'an object with an array of integers'
            },
            json: {myArray: [1, 2]},
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'an object with an array of integers',
                type: 'object',
                properties: {
                    myArray: {
                        type: 'array',
                        items: {
                            type: 'integer'
                        }
                    }
                }
            }
        },

        {
            options: {
                description: 'a tuple array',
                includeRequired: true
            },
            json: ['one', {name: 'Bob'}],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a tuple array',
                type: 'array',
                items: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            }
                        },
                        required: ['name']
                    }
                ],
                required: ['0', '1']
            }
        },

        {
            options: {
                description: 'a similar array',
                includeRequired: true
            },
            json: [
                {name: 'Jill'},
                {name: 'Bob', age: 42}
            ],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a similar array',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        age: {
                            type: 'integer'
                        }
                    },
                    required: ['name']
                }
            }
        },

        {
            options: {
                description: 'a similar array with a high similarityThreshold',
                similarityThreshold: 0.9
            },
            json: [
                {name: 'Bob'},
                {name: 'Jane', age: 23}
            ],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a similar array with a high similarityThreshold',
                type: 'array',
                items: [
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            }
                        }
                    },
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            },
                            age: {
                                type: 'integer'
                            }
                        }
                    }
                ]
            }
        },

        {
            options: {
                description: 'default and enum values',
                defaultValues: true,
                enumValues: true
            },
            json: {
                name: 'Bob',
                myArray: ['one', 'two']
            },
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'default and enum values',
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        default: 'Bob',
                        enum: ['Bob', null]
                    },
                    myArray: {
                        type: 'array',
                        items: {
                            type: 'string',
                            default: 'two',
                            enum: ['one', 'two', null]
                        }
                    }
                }
            }
        },

        {
            options: {
                id: 'http://example.com/my-schema/',
                title: 'Quite verbose',
                description: 'verbose metadata',
                verboseMetadata: true
            },
            json: {
                name: 'John Doe',
                phone: {
                    'country-code': '+1',
                    number: '123-456-7890'
                }
            },
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                id: 'http://example.com/my-schema/',
                title: 'Quite verbose',
                description: 'verbose metadata',
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        title: 'name schema',
                        description: 'TODO: a description of this schema.',
                        id: 'http://example.com/my-schema/name/'
                    },
                    phone: {
                        id: 'http://example.com/my-schema/phone/',
                        title: 'phone schema',
                        description: 'TODO: a description of this schema.',
                        type: 'object',
                        properties: {
                            'country-code': {
                                type: 'string',
                                id: 'http://example.com/my-schema/phone/country-code/',
                                title: 'phone/country-code schema',
                                description: 'TODO: a description of this schema.',
                            },
                            number: {
                                type: 'string',
                                id: 'http://example.com/my-schema/phone/number/',
                                title: 'phone/number schema',
                                description: 'TODO: a description of this schema.',
                            }
                        }
                    }
                }
            }
        },

        {
            options: {
                description: 'the numberProperties option',
                numberProperties: {
                    minimum: 0,
                    exclusiveMinimum: false,
                    maximum: 100,
                    exclusiveMaximum: true,
                    multipleOf: 2
                }
            },
            json: 42.5,
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'the numberProperties option',
                type: 'number',
                minimum: 0,
                exclusiveMinimum: false,
                maximum: 100,
                exclusiveMaximum: true,
                multipleOf: 2
            }
        },

        {
            options: {
                description: 'the stringProperties option',
                stringProperties: {
                    minLength: 1,
                    maxLength: 255
                }
            },
            json: 'Hello world!',
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'the stringProperties option',
                type: 'string',
                minLength: 1,
                maxLength: 255
            }
        },

        {
            options: {
                description: 'the objectProperties option',
                objectProperties: {
                    minProperties: 0,
                    maxProperties: 0,
                    additionalProperties: {type: 'string'}
                }
            },
            json: {},
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'the objectProperties option',
                type: 'object',
                properties: {},
                minProperties: 0,
                maxProperties: 0,
                additionalProperties: {type: 'string'}
            }
        },

        {
            options: {
                description: 'the arrayProperties option',
                arrayProperties: {
                    additionalItems: true,
                    minItems: 0,
                    uniqueItems: true
                }
            },
            json: [],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'the arrayProperties option',
                type: 'array',
                items: {},
                additionalItems: true,
                minItems: 0,
                uniqueItems: true
            }
        },

        {
            options: {
                description: 'a customizer function'
            },
            customizer: function(schema, json, path) {
                if (path[path.length-1] === 'email') {
                    schema.format = 'email';
                }
            },
            json: [
                { name: 'Jill', email: 'jill@example.com' }
            ],
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                description: 'a customizer function',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        }
                    }
                }
            }
        },

        {
            options: {
                arrayType: 'same',
                includeRequired: true
            },
            json: {
                category: {
                    displayName: 'Greatness'
                },
                qna: [
                    {
                        displayText: 'How are you?',
                        type: 'header'
                    },
                    [
                        {
                            displayText: 'Happiness (1 = miserable, 5 = great)',
                            response: '2',
                            type: 'rate'
                        }, {
                            displayText: 'Charisma (1 = miserable, 5 = great)',
                            response: '5',
                            type: 'rate'
                        }
                    ]
                ]
            },
            schema: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                properties: {
                    category: {
                        type: 'object',
                        properties: {
                            displayName: {
                                type: 'string'
                            }
                        },
                        required: [
                            'displayName'
                        ]
                    },
                    qna: {
                        type: 'array',
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    displayText: {
                                        type: 'string'
                                    },
                                    response: {
                                        type: 'string'
                                    },
                                    type: {
                                        type: 'string'
                                    }
                                },
                                required: [
                                    'displayText',
                                    'response',
                                    'type'
                                ]
                            }
                        }
                    }
                },
                required: [
                    'category',
                    'qna'
                ]
            }
        }
    ];

    _.each(testData, function(entry) {
        var description = (entry.options && entry.options.description) || 'some JSON with no options';
        it('should generate a schema with ' + description, function() {
            var schema = generateSchema(entry.json, entry.options, entry.customizer);
            schema.must.eql(entry.schema);
        });
    });

});
