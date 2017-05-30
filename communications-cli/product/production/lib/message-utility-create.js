#!/usr/bin/env node

'use strict';

var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var oracledb = require('oracledb');
var configHelper = require('./oracle-config-helper.js');

var categorySystem = 'http://ehmp.DNS   /messageCategories';
var statusSystem = 'http://hl7.org/fhir/ValueSet/communication-status';
var statusCode = 'completed';
var categoryCode;
var sender;
var recipient;
var payloadContent;
var payloadData;
var payloadTitle;
var attachmentData;
var attachmentContentType;

var oracleConfig = {
    user: '',
    password: '',
    connectString: ''
};

/**
 * Creates multiple messages by importing a json file.
 * @param argv - object of cli arguments
 */
function createMessagesFromFile(argv) {
    /**
     * 1. Reads and parses JSON file. Passes parsed data on.
     * 2. Ensures all objects have required fields. Passes messages on.
     * 3. Creates oracle connection. Passes connection and messages on.
     * 4. Loops through messages, inserting each one in db. Upon success,
     *    messages are committed.
     */
    async.waterfall([
        function(callback) {
            readMessagesFile(argv.file, function(error, parsedInput) {
                return callback(error, parsedInput);
            });
        },
        function(messages, callback) {
            validateBulkMessageParams(messages, function(err) {
                if (err) {
                    return callback(err);
                }
                return callback(null, messages);
            });
        },
        function(messages, callback) {
            if (!argv.host) {
                configHelper.getOracleConfig(argv.config, argv.connectionObject, function(err, config) {
                    if (err) {
                        return callback(err);
                    }
                    oracleConfig = config;
                    createOracleConnection(function(err, connection) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, connection, messages);
                    });
                });
            } else {
                oracleConfig.user = argv.user;
                oracleConfig.password = argv.password;
                oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
                createOracleConnection(function(err, connection) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, connection, messages);
                });
            }
        },
        function(connection, messages, callback) {
            bulkImportMessages(connection, messages, function(err, response) {
                if (err) {
                    doRelease(connection);
                    return callback(err);
                }
                commitOracleTransactions(connection, function(err) {
                    if (err) {
                        doRelease(connection);
                        return callback(err);
                    }
                    doRelease(connection);
                    return callback(null, response);
                });

            });
        }
    ], function(error, result) {
        if (error) {
            console.log(error);
            return;
        }
        _.each(result, function(messageId) {
            console.log('Message Created: ' + messageId);
        });
    });
}

/**
 * Creates a single message from supplied parameters
 * @param argv - Arguments supplied from CLI
 */
function createSingleMessage(argv) {
    /**
     * 1. Checks that all required fields are present.
     * 2. Checks if contentData is provided - then serializes it
     * 3. Checks if attachment and content-type is provided. Verify file exist & not > 1 mb
     * 4. Creates an oracle connection
     * 5. Calls createMessages method - calls commitOracleTranasactions on success
     * 6. Handles errors
     */
    async.waterfall([
            function(callback) {
                if (!isValidParams(argv.cat, argv.content, argv.title, argv.sender)) {
                    return callback('Category, Content, Title, and Sender are required');
                }
                // If version is supplied, truncate it
                if (!_.isEmpty(argv.version)) {
                    recipient = truncateAppVersion(argv.version);
                }
                //Store argv values
                categoryCode = argv.cat;
                payloadContent = argv.content;
                payloadTitle = argv.title;
                sender = argv.sender;

                return callback();
            },
            function(callback) {
                // If contentData is supplied, parse and serialize it
                if (argv.contentData) {
                    validateAndSerializeContentData(argv.contentData, function(error, serializedJSON) {
                        if (error) {
                            return callback(error);
                        }
                        // Store PayloadData JSON
                        payloadData = serializedJSON;
                        return callback();
                    });
                } else {
                    return callback();
                }
            },
            function(callback) {
                if (!(argv.attachment && argv.contentType)) {
                    return callback();
                }
                getFileSizeMegabytes(argv.attachment, function(err, size) {
                    if (err) {
                        return callback(err);
                    } else if (size > 1) {
                        return callback('File exceeds 1 Megabyte');
                    } else {
                        attachmentData = argv.attachment;
                        attachmentContentType = argv.contentType;
                        return callback();
                    }
                });
            },
            function(callback) {
                if (!argv.host) {
                    configHelper.getOracleConfig(argv.config, argv.connectionObject, function(err, config) {
                        if (err) {
                            return callback(err);
                        }
                        oracleConfig = config;
                        createOracleConnection(function(err, connection) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, connection);
                        });
                    });
                } else {
                    oracleConfig.user = argv.user;
                    oracleConfig.password = argv.password;
                    oracleConfig.connectString = argv.host + ':' + argv.port + '/' + argv.service;
                    createOracleConnection(function(err, connection) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, connection);
                    });
                }
            },
            function(connection, callback) {
                createMessages(connection, function(err, messageIdentifier) {
                    if (err) {
                        doRelease(connection);
                        return callback(err);
                    }
                    commitOracleTransactions(connection, function(err) {
                        if (err) {
                            doRelease(connection);
                            return callback(err);
                        }
                        doRelease(connection);
                        console.log('Message created: ' + messageIdentifier);
                    });

                    // If an attachment is specified, stream it into the newly created message
                    if (attachmentData) {
                        insertAttachmentOracle(messageIdentifier);
                    }
                });
            }
        ],
        function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
        });
}

/**
 * Validates that the required parameters to create a message are not empty
 * @param category
 * @param content
 * @param title
 * @param sender
 * @returns {boolean}
 */
function isValidParams(category, content, title, sender) {
    if (_.isEmpty(category) || _.isEmpty(content) || _.isEmpty(title) || _.isEmpty(sender)) {
        return false;
    }
    return true;
}
/**
 * Truncates app version to only include major and minor
 * @param appVersion - version to truncated
 */
function truncateAppVersion(appVersion) {
    if (_.isEmpty(appVersion)) {
        return '';
    }
    var version = appVersion.split('.');
    var truncatedVersion;
    if (version.length > 2) {
        version.length = 2;
    }
    truncatedVersion = version.join('.');
    return truncatedVersion;
}
/**
 * Parses and serializes contentData, returns any errors to callback
 * @param data
 * @param callback
 */
function validateAndSerializeContentData(data, callback) {
    var parsedJSON;
    try {
        parsedJSON = JSON.parse(data);
    } catch (err) {
        return callback('Malformed JSON: ' + err);
    }

    try {
        return callback(null, JSON.stringify(parsedJSON));
    } catch (err) {
        return callback(err);
    }
}
/**
 * Returns filesize in megabytes
 * @param  filename
 * @return filesize
 */
function getFileSizeMegabytes(filename, callback) {
    fs.stat(filename, function(err, stats) {
        if (err) {
            return callback(err);
        }
        var fileSize = stats.size / 1000000;
        return callback(null, fileSize);
    });
}
/**
 * Reads and parses json files
 * @param file - file specified in file argument
 * @param callback - the callback to call when done
 */
function readMessagesFile(file, callback) {
    fs.readFile(file, function(err, data) {
        if (err) {
            return callback(err);
        }
        try {
            return callback(null, JSON.parse(data));
        } catch (err) {
            return callback('JSON malformed: ' + err);
        }
    });
}
/**
 * Loops through each message object and calls
 * createMessages to store each message. If a message is missing paramters or
 * has an error the function will move on to the next message.
 * @param connection
 * @param parsedInput - json object
 * @param callback
 */
function bulkImportMessages(connection, parsedInput, callback) {
    var messageCollection = [];
    async.eachSeries(parsedInput, function(message, callback) {
        // If version is supplied, truncate it
        if (!_.isEmpty(message['ehmp-app-version'])) {
            recipient = truncateAppVersion(message['ehmp-app-version']);
        }

        sender = message.sender;
        categoryCode = message.category;
        payloadContent = message.content;
        payloadTitle = message.title;

        createMessages(connection, function(error, messageId) {
            if (error) {
                return callback(error); // Move onto next object
            }
            messageCollection.push(messageId);
            return callback(); // Call Async series callback when finished storing in Oracle
        });
    }, function(err) {
        if (err) {
            return callback(err);
        }
        return callback(null, messageCollection);

    });
}

/**
 * Loops through each object and ensures required fields
 * are present.
 * required fields are present
 * @param  messgaes
 * @param  callback
 */
function validateBulkMessageParams(messages, callback) {
    async.eachOf(messages, function(message, key, callback) {
        if (!isValidParams(message.category, message.content, message.title, message.sender)) {
            return callback('Category, Content, Title, and Sender are required. Parameters are invalid for message: ' + key);
        }
        return callback();
    }, function(err) {
        if (err) {
            return callback(err);
        }
        return callback();
    });
}
/**
 * Creates Oracledb connection, calls create_message stored procedure
 * @param connection - oracleDB connection
 * @param callback - Callback to call when finished
 */
function createMessages(connection, callback) {
    var bindParams = {
        id: {
            val: '',
            dir: oracledb.BIND_INOUT,
            type: oracledb.STRING
        },
        categorySystem: {
            val: categorySystem,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        categoryCode: {
            val: categoryCode,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        sender: {
            val: sender,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        recipient: {
            val: recipient,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        payload_content: payloadContent,
        payload_data: payloadData,
        payload_title: {
            val: payloadTitle,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        attachment_data: new Buffer(0),
        attachment_contenttype: {
            val: attachmentContentType,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        sentDate: {
            val: new Date(),
            dir: oracledb.BIND_IN
        },
        statusSystem: {
            val: statusSystem,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        statusCode: {
            val: statusCode,
            dir: oracledb.BIND_IN,
            type: oracledb.STRING
        },
        output: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        }
    };
    var procedure_create_message = 'BEGIN COMMUNICATION.MESSAGE_API.CREATE_MESSAGE(:id, :categorySystem, :categoryCode, :sender, :recipient, :payload_content, :payload_data, :payload_title, :attachment_data, :attachment_contenttype, :sentDate, :statusSystem, :statusCode, :output); END;';
    connection.execute(procedure_create_message, bindParams, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result.outBinds.id);
    });
}
/**
 * Streams attachmentData blob into payload_attachment_data field
 * @param  identifier
 */
function insertAttachmentOracle(identifier) {
    oracledb.getConnection(oracleConfig, function(err, connection) {
        if (err) {
            console.log(err);
            return;
        }
        var bindParams = {
            id: {
                val: identifier,
                dir: oracledb.BIND_IN
            },
            attachment_data: {
                type: oracledb.BLOB,
                dir: oracledb.BIND_OUT
            }
        };
        var update_attachment_message = 'UPDATE communication.message SET payload_attachment_data = EMPTY_BLOB() WHERE identifier = :id RETURNING payload_attachment_data INTO :attachment_data ';
        connection.execute(update_attachment_message, bindParams, {
            autoCommit: false
        }, function(err, result) {
            if (err) {
                doRelease(connection);
                console.log(err);
                return;
            }
            if (result.rowsAffected !== 1 || result.outBinds.attachment_data.length !== 1) {
                console.log('Error getting a LOB object');
                doRelease(connection);
                return;
            }
            var lob = result.outBinds.attachment_data[0];
            lob.on('close', function() {
                connection.commit(
                    function(err) {
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                            return;
                        }
                        console.log('Attachment stored');
                        doRelease(connection);
                        return;
                    });
            });
            lob.on('error', function(err) {
                console.log(err);
                doRelease(connection);
                return;
            });
            // Stream attachmentData
            var attachmentStream = fs.createReadStream(attachmentData);
            attachmentStream.on('error', function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            attachmentStream.pipe(lob);
        });
    });
}

/**
 * Creates a connection to OracleDB
 * @param  {Function} callback - returns error or connection
 */
function createOracleConnection(callback) {
    oracledb.getConnection(oracleConfig, function(err, connection) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, connection);
        }
    });
}

/**
 * Commits transactions
 * @param  connection
 * @param  callback
 */
function commitOracleTransactions(connection, callback) {
    connection.commit(function(err) {
        if (err) {
            return callback(err);
        } else {
            return callback();
        }
    });
}

/**
 * Releases Oracle connection
 * @param connection - Connection to close
 */
function doRelease(connection) {
    connection.close(
        function(err) {
            if (err) {
                console.log(err);
            }
        });
}

exports.createSingleMessage = createSingleMessage;
exports.createMessagesFromFile = createMessagesFromFile;
exports._isValidParams = isValidParams;
exports._truncateAppVersion = truncateAppVersion;
exports._validateAndSerializeContentData = validateAndSerializeContentData;
exports._readMessagesFile = readMessagesFile;
exports._createOracleConnection = createOracleConnection;
exports._commitOracleTransactions = commitOracleTransactions;
exports._doRelease = doRelease;
exports._createMessages = createMessages;
exports._validateBulkMessageParams = validateBulkMessageParams;
exports._getFileSize = getFileSizeMegabytes;
exports._bulkImportMessages = bulkImportMessages;
exports._insertAttachmentOracle = insertAttachmentOracle;
