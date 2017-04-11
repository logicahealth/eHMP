'use strict';

// Contains logic needed to support the communication resource's use of the beanstalk queue.  This is a special case
// outside of beanstalk's original design.
//
// You should have a full understanding of the beanstalk protocol before modifying this file.
// https://github.com/kr/beanstalkd/blob/master/doc/protocol.txt

var _ = require('lodash');
var async = require('async');
var Beanstalk = require('./../../../subsystems/beanstalk-subsystem');
var EvtArray = require('../utils/utils-evented-array');

var TIME_WAIT = 0;
var PRIORITY = 1;
var DELAY = 0;
var TTR = 300; //Lowering this value too much could result in an infinite loop

var host = '127.0.0.1';
var PORT        ;
var logger = null;

var queues = {};

//Create and use one connection for all beanstalk communication during a single action (enqueue, dequeue, ...).
function createOpenConnection(context, callback) {
    logger.debug('Opening new beanstalk connection for communication request processing.');

    var beanstalkClient = Beanstalk.client(logger, host, port);

    beanstalkClient.openConnection(function(err, client) {
        if (err) {
            return callback(err, context);
        }

        context.client = client;
        return callback(null, context);
    });
}

function createWatch(context, callback) {
    logger.debug('Watching queue %s for communication request processing.', context.queueName);

    context.client.watch(context.queueName, function(err) {
        if (err) {
            logger.error({error: err}, 'Unable to watch queue %s.', context.queueName);
            return callback(err, context);
        }

        return callback(null, context);
    });
}

function reserveWithZeroTimeout(context, callback) {
    logger.debug('Reserving message for communication request processing.', context.queueName);

    context.client.reserveWithTimeout(TIME_WAIT, function(err, jobid, payload) {
        if (err && err !== 'TIMED_OUT') {
            logger.error({error: err}, 'Error reserving message.');
            return callback(err);
        }

        return callback(null, jobid, payload);
    });
}

function createMessage(payload, jobId) {
    var message = _.attempt(JSON.parse.bind(null, payload));

    if (_.isError(message)) {
        logger.error({message: message}, 'Unable to parse message returned from queue.');
    } else {
        message.id = jobId;
    }

    return message;
}

function addMessage(messages, message) {
    if (!_.isError(message)) {
        messages.push(message);
    }
}

// Pull all available messages off a queue now.
function getAllQueuedMessages(context, jobProcessing, callback) {
    logger.debug('Getting all messages from a queue for communication request processing.');

    async.doUntil(
        function(whileCallback) {
            reserveWithZeroTimeout(context, function(err, jobid, payload) {
                context.id = jobid;

                if (err) {
                    return whileCallback(err);
                }

                if (jobid) {
                    return jobProcessing(context, payload, whileCallback);
                }

                return setImmediate(whileCallback);
            });
        },
        function() {
            return _.isUndefined(context.id);
        },
        function(err) {
            if (err) {
                logger.error({error: err}, 'Error reserving message.');
            }

            return callback(err, context);
        }
    );
}

function retrieveAllMessages(context, callback) {
    logger.debug('Retrieve all messages from a queue for communication request processing.');

    var jobProcessing = function(context, payload, jobCallback) {
        logger.debug('Processing job data for communication request processing.');

        addMessage(context.messages, createMessage(payload, context.id));
        return jobCallback();
    };

    return getAllQueuedMessages(context, jobProcessing, callback);
}

function deleteSingleMessage(context, callback) {
    logger.debug('Delete message with id %s from a queue for communication request processing.', context.id);

    context.client.destroy(context.id, function(err) {
        if (err) {
            logger.error({error: err}, 'Unable to delete message with id %s from queue %s.', context.id, context.queueName);
            return callback(err, context);
        }
        return callback(null, context);
    });
}

function removeAllMessages(context, callback) {
    logger.debug('Remove all messages from a queue for communication request processing.');

    var jobProcessing = function(context, payload, jobCallback) {
        deleteSingleMessage(context, function(err) {
            if (err) {
                return jobCallback(err);
            }

            return jobCallback();
        });
    };

    return getAllQueuedMessages(context, jobProcessing, callback);
}

function getMessageById(context, callback) {
    logger.debug('Get message with id %s from a queue for communication request processing.', context.id);

    context.client.peek(context.id, function(err, jobId, payload) {
        if (err) {
            return callback(err, context);
        }
        var message = createMessage(payload, jobId);

        if (!_.isError(message)) {
            context.message = message;
            return callback(null, context);
        } else {
            return callback(message.description, context);
        }
    });
}

function releaseAllMessages(context, callback) {
    logger.debug('Releasing all messages back to queue for communication request processing.');

    if (!_.isArray(context.messages) || context.messages.length === 0) {
        return callback(null, context);
    }

    var client = context.client;

    async.each(context.messages, function(message, eachCallback) {
        client.release(message.id, PRIORITY, DELAY, function(err) {
            if (err) {
                logger.error({error: err}, 'Unable to release a message back into the queue.');
            }

            return setImmediate(eachCallback, err);
        });
    }, function(err) {
        callback(err, context);
    });
}

function queueMessages(context, callback) {
    logger.debug('Queueing all messages for communication request processing.');

    var client = context.client;

    async.eachSeries(context.queueNames, function(queueName, eachCallback) {
            client.use(queueName, function(err, tubeName) {
                logger.debug('Queueing message to queue %s for communication request processing.', queueName);

                if (err) {
                    logger.error({error: err}, 'Unable to use queue %s. ', tubeName);
                    return eachCallback(err);
                }
                //queue takes more than TTR to process then we have a possible infinite loop. make sure TTR is big enough.
                client.put(PRIORITY, DELAY, TTR, JSON.stringify(context.message), function(err) {
                    if (err) {
                        logger.error({error: err}, 'Unable to put message in queue %s.', tubeName);
                    }
                    /* listeners firing start */
                    if (_.isUndefined(queues[queueName])) {
                        queues[queueName] = new EvtArray();
                    }
                    var fired = queues[queueName].fire({
                        type: 'added',
                        target: queueName
                    });
                    if (_.isError(fired)) {
                        return callback({
                            code: 500,
                            message: fired.message
                        });
                    }
                    /* listeners firing end */
                    return setImmediate(eachCallback, err);
                });
            });
        },
        function(err) {
            callback(err, context);
        }
    );
}

function processBeanstalkErrorMessage(err, notFoundObject) {
    if (err === 'NOT_FOUND') {
        return notFoundObject;
    }

    if (err === 'JOB_TOO_BIG') {
        return {
            code: 500,
            message: 'Communication request was not processed. Communication request was too large to process.'
        };
    }

    return {
        code: 500,
        message: 'Communication request was not processed. Server error.'
    };
}

var errHandlerWithNotFound = _.partial(processBeanstalkErrorMessage, _, {
    code: 404,
    message: 'Unable to find message.'
});
var errHandlerIgnoreNotFound = _.partial(processBeanstalkErrorMessage, _, null);

// Functions create a context object used to store information during beanstalk queue processing. A single connection
// is created and used for each call to a public a function.
//
// init function should be called before calling any other public function.
module.exports = {
    init: function(appLogger, beanstalkHost, beanstalkPort) {
        logger = appLogger;
        host = beanstalkHost;
        port = beanstalkPort;
    },
    addListenerOnce: function(event, queueName, callback, options) {

        if (_.isUndefined(queues[queueName])) {
            queues[queueName] = new EvtArray();
        }
        queues[queueName].addListenerOnce(event, callback, options);
    },
    enqueue: function(queueNames, message, callback) {
        logger.debug('Starting to enqueue messages to queue(s) %s.', queueNames);

        async.waterfall([

                function(callback) {
                    return callback(null, {
                        queueNames: queueNames,
                        message: message
                    });
                },
                createOpenConnection,
                queueMessages
            ],

            function completionCallback(err, context) {
                if (context && context.client) {
                    context.client.closeConnection();
                }

                if (err) {
                    return callback(errHandlerWithNotFound(err));
                }
                return callback();
            }
        );
    },

    dequeue: function(queueName, id, callback) {
        logger.debug('Starting to dequeue message with id %s from queue %s.', id, queueName);

        async.waterfall([

                function(callback) {
                    return callback(null, {
                        queueName: queueName,
                        id: id
                    });
                },
                createOpenConnection,
                getMessageById
            ],
            function completionCallback(err, context) {
                context.client.closeConnection();

                if (err) {
                    return callback(errHandlerWithNotFound(err));
                }

                return callback(null, context.message);
            }
        );
    },

    dequeueAll: function(queueName, callback) {
        logger.debug('Starting to dequeue all messages from queue %s.', queueName);

        async.waterfall([

                function(callback) {
                    return callback(null, {
                        queueName: queueName,
                        messages: []
                    });
                },
                createOpenConnection,
                createWatch,
                retrieveAllMessages,
                releaseAllMessages
            ],
            function completionCallback(err, context) {
                if (context && context.client) {
                    context.client.closeConnection();
                }

                if (err) {
                    return callback(errHandlerWithNotFound(err));
                }

                return callback(null, context.messages);
            }
        );
    },

    delete: function(queueName, id, callback) {
        logger.debug('Starting to delete message with id %s from queue %s.', id, queueName);

        async.waterfall([

                function(callback) {
                    return callback(null, {
                        queueName: queueName,
                        id: id
                    });
                },
                createOpenConnection,
                deleteSingleMessage
            ],
            function completionCallback(err, context) {
                context.client.closeConnection();

                if (err) {
                    return callback(errHandlerIgnoreNotFound(err));
                }

                return callback();
            }
        );
    },

    removeQueue: function(queueName, callback) {
        logger.debug('Starting to remove all messages from queue %s.', queueName);

        async.waterfall([

                function(callback) {
                    return callback(null, {
                        queueName: queueName
                    });
                },
                createOpenConnection,
                createWatch,
                removeAllMessages
            ],
            function completionCallback(err, context) {
                context.client.closeConnection();

                if (err) {
                    return callback(errHandlerIgnoreNotFound(err));
                }

                return callback();
            }
        );
    }
};
