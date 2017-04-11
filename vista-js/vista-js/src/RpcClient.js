'use strict';

var _ = require('underscore');
var async = require('async');

var RpcSerializer = require('./RpcSerializer').RpcSerializer;
var RpcParameter = require('./RpcParameter').RpcParameter;
var RpcCall = require('./RpcCall').RpcCall;
var RpcSender = require('./RpcSender').RpcSender;

/*
config = {
    host: ,
    port: ,
    accessCode: ,
    verifyCode: ,
    division: ,
    context: ,
    localIP: ,
    localAddress: ,
    connectTimeout: ,
    sendTimeout: ,
    noReconnect: ,
    noMetrics:
};
*/
function RpcClient(logger, config) {
    logger.debug('RpcClient.RpcClient(%s:%s)', config.host, config.port);
    if (!(this instanceof RpcClient)) {
        return new RpcClient(logger, config);
    }

    this.queue = async.queue(this._worker.bind(this), 1);

    this.queue._noReconnect = config.noReconnect;
    this.queue._highWaterMark = 0;

    this.logger = logger;
    this.config = config;
    this.sender = null;
}


RpcClient.create = function create(logger, config) {
    logger.debug('RpcClient.create(%s:%s)', config.host, config.port);
    return new RpcClient(logger, config);
};


RpcClient.prototype._worker = function _worker(task, queueCallback) {
    this.logger.debug('RpcClient._worker(%s:%s)', this.config.host, this.config.port);

    function executeCallbacks(error, result) {
        // task.callback(error, result);
        // queueCallback();
        setTimeout(task.callback, 0, error, result);
        setTimeout(queueCallback);
    }

    if (task.isConnector) {
        return task(function(error, result) {
            executeCallbacks(error, result);
        });
    }

    var self = this;
    task(function(error, result) {
        if (error) {
            if (self.queue._noReconnect) {
                return executeCallbacks(error, result);
            }

            return self._connect(function(error) {
                if (error) {
                    return executeCallbacks(error);
                }

                task(function(error, result) {
                    return executeCallbacks(error, result);
                });
            });
        }

        executeCallbacks(error, result);
    });
};


RpcClient.prototype._enqueue = function _enqueue(task) {
    this.logger.debug('RpcClient._enqueue(%s:%s)', this.config.host, this.config.port);

    this.queue.push(task);
    this.queue._highWaterMark = this.queue.length() > this.queue._highWaterMark ? this.queue.length() : this.queue._highWaterMark;
};


// Send the greeting, signonSetup, verifyLogin and setContext commands.
//
// The callback will be called with the parameters:
//    callback(error, loginInfo)
RpcClient.prototype.connect = function connect(callback) {
    this.logger.debug('RpcClient.connect(%s:%s)', this.config.host, this.config.port);

    var task = this._connect.bind(this);
    task.callback = callback;
    task.command = 'connect';
    task.isConnector = true;

    this._enqueue(task);
};


RpcClient.prototype._connect = function _connect(callback) {
    this.logger.debug('RpcClient._connect(%s:%s)', this.config.host, this.config.port);

    if (!_.isUndefined(this.sender) && !_.isNull(this.sender)) {
        this.sender.close();
    }

    this._createSender();
    this.logger.trace('RpcClient._connect(%s:%s) sender created', this.config.host, this.config.port);

    async.series({
        connect: this.sender.connect.bind(this.sender),
        greeting: this.greetingCommand.bind(this),
        signon: this.signonCommand.bind(this),
        verify: this.verifyCommand.bind(this),
        division: this.divisionCommand.bind(this),
        context: this.contextCommand.bind(this)
    }, function(error, results) {
        if (error) {
            return callback(error, results);
        }

        callback(null, results.verify);
    });
};

RpcClient.prototype._createSender = function _createSender() {
    this.logger.debug('RpcClient._createSender(%s:%s)', this.config.host, this.config.port);
    this.sender = new RpcSender(this.logger, this.config);
};


/*
variadic function:
execute(rpcCall, callback)
execute(startTime, rpcCall, callback)
execute(rpcName, [param]..., callback)
execute(startTime, pcName, [param]..., callback)
*/
RpcClient.prototype.execute = function execute(startTime, rpcCall, callback) {
    this.logger.debug('RpcClient.execute(%s:%s)', this.config.host, this.config.port);

    // Start: Variadic disambiguation
    var args = _.toArray(arguments);

    if (_.isNumber(args[0])) {
        startTime = args.shift();
    } else {
        startTime = Date.now();
    }

    if (args.length < 2) {
        callback = args[0];
        return setTimeout(callback, 0, 'Insufficient number of arguments');
    }

    callback = args.pop();

    var rpcCallParams = args;
    if (_.isArray(_.first(args))) {
        rpcCallParams = _.first(rpcCallParams);
    }
    // End: Variadic disambiguation

    this.logger.debug('RpcClient.execute(%s:%s) -> rpcCallParams: %j', this.config.host, this.config.port, rpcCallParams);
    rpcCall = RpcCall.create(rpcCallParams);

    if (!rpcCall) {
        return setTimeout(callback, 0, 'Invalid arguments for rpcCall');
    }

    var task = this._execute.bind(this, startTime, rpcCall);
    task.callback = callback;
    task.command = 'execute';

    this._enqueue(task);
};


/*
variadic function:
_execute(rpcCall, callback)
_execute(startTime, rpcName, callback)
*/
RpcClient.prototype._execute = function _execute(startTime, rpcCall, callback) {
    this.logger.debug('RpcClient._execute(%s:%s)', this.config.host, this.config.port);

    if (arguments.length < 3) {
        callback = arguments[1];
        rpcCall = arguments[0];
        startTime = -1;
    }

    var rpcString = RpcSerializer.buildRpcString(rpcCall);

    var self = this;
    if (_.isUndefined(self.sender) || _.isNull(self.sender)) {
        return setTimeout(callback, 0, 'Connection not initialized');
    }

    this.sender.send(rpcString, function(error, result) {
        logMetrics(self.logger, self.config, rpcCall, startTime);
        callback(error, result);
    });
};

function logMetrics(logger, config, rpcCall, startTime) {
    if (config.noMetrics || startTime < 0) {
        return;
    }

    var metrics = {
        elapsedMilliseconds: Date.now() - startTime,
        host: config.host,
        port: config.port,
        rpc: _.isString(rpcCall) ? rpcCall : rpcCall.rpcName
    };

    if (!_.isEmpty(rpcCall.params)) {
        metrics.parameters = rpcCall.params;
    }

    logger.info(metrics, 'Vista-RPC-Metric - Call Elapsed Time');
}

RpcClient.prototype.close = function close(callback) {
    callback = callback || function() {};
    var self = this;
    self.logger.debug('RpcClient.close(%s:%s)', self.config.host, self.config.port);

    var task = this._close.bind(this);
    task.callback = callback;
    task.command = 'close';
    task.isConnector = true;

    this._enqueue(task);
};


RpcClient.prototype._close = function _close(callback) {
    callback = callback || function() {};
    var self = this;
    self.logger.debug('RpcClient._close(%s:%s)', self.config.host, self.config.port);

    if (_.isUndefined(self.sender) || _.isNull(self.sender)) {
        return callback();
    }

    self.signoffCommand(function(error, result) {
        // we don't care if it returns an error, because
        // we call sender.close() in any case.
        self.sender.close();
        self.sender = null;
        callback(null, result || error);
    });
};


RpcClient.prototype.greetingCommand = function greetingCommand(callback) {
    var self = this;
    self.logger.debug('RpcClient.greetingCommand(%s:%s)', self.config.host, self.config.port);

    var rpcString = RpcSerializer.buildRpcGreetingString(this.config.localIP, this.config.localAddress);
    this.sender.send(rpcString, function greetingCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.greetingCommand(%s:%s) error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.greetingCommand(%s:%s) received: %j', self.config.host, self.config.port, result);
        if (result !== 'accept') {
            return callback('Response to greeting was invalid', result);
        }

        callback(null, 'HANDSHAKE SUCCESSFUL');
    });
};

RpcClient.prototype.signonCommand = function signonCommand(callback) {
    var self = this;
    self.logger.debug('RpcClient.signonCommand(%s:%s)', self.config.host, self.config.port);

    var rpcString = RpcSerializer.buildRpcString('XUS SIGNON SETUP');
    this.sender.send(rpcString, function signonCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.signonCommand(%s:%s) error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.greetingCommand(%s:%s) received: %j', self.config.host, self.config.port, result);
        if (!result || result.length === 0) {
            return callback('No response to signon callback');
        }

        callback(null, 'SIGNON SETUP SUCCESSFUL');
    });
};

RpcClient.prototype.verifyCommand = function verifyCommand(callback) {
    var self = this;
    self.logger.debug('RpcClient.verifyCommand(%s:%s)', self.config.host, self.config.port);

    var accessCode = this.config.accessCode;
    var verifyCode = this.config.verifyCode;
    var rpcString = RpcSerializer.buildRpcString('XUS AV CODE', RpcParameter.encrypted(accessCode + ';' + verifyCode));
    this.sender.send(rpcString, function verifyCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.verifyCommand(%s:%s) error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.verifyCommand(%s:%s) received: %j', self.config.host, self.config.port, result);
        if (_.isUndefined(result) || _.isNull(result) || result.length === 0) {
            return callback('No response to login request');
        }

        var parts = result.split('\r\n');

        if (parts[0] === '0') {
            var err = parts.length < 3 || parts[3] === '0' ? 'No DUZ returned from login request' : parts[3];
            return callback(err, result);
        }

        var response = {
            accessCode: accessCode,
            verifyCode: verifyCode,
            duz: parts[0],
            greeting: parts.length > 7 ? parts[7] : 'OK'
        };

        callback(null, response);
    });
};

RpcClient.prototype.divisionCommand = function divisionCommand(callback) {
    /*
    division is an optional parameter. If one is passed we need to perform the following actions:
    1. Get the User information to get the list of divisions for the user
    2. Make sure the division asked for is in the list
    3. Set the division requested, if more than one division is possible for the user
    */
    var self = this;
    self.logger.debug('RpcClient.divisionCommand(%s:%s)', self.config.host, self.config.port);

    // If we don't have a division quit this call
    if ((this.config.division === null) || (this.config.division === undefined)) {
        self.logger.debug('RpcClient.divisionCommand(%s:%s) - No division passed, skipping this call', self.config.host, self.config.port);
        return callback(null, 0);
    }

    // Force the division to a string for a compare later
    var division = String(this.config.division);
    self.logger.debug('RpcClient.divisionCommand(%s:%s) - Attempting to set division %s', self.config.host, self.config.port, division);

    // Get the list of the user's divisions
    var rpcString = RpcSerializer.buildRpcString('XUS DIVISION GET');
    this.sender.send(rpcString, function divisionGetCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.divisionCommand(%s:%s) - Get divisions error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.divisionCommand(%s:%s) - Get divisions received: %j', self.config.host, self.config.port, result);
        if (result === '0\r\n') {
            self.logger.debug('RpcClient.divisionCommand(%s:%s) - Single division user found', self.config.host, self.config.port);

            // Check if the requested division is the only one configured for the user
            var userInfoRpcString = RpcSerializer.buildRpcString('XUS GET USER INFO');
            self.sender.send(userInfoRpcString, function userInfoCallback(error, result) {
                if (error) {
                    self.logger.debug('RpcClient.divisionCommand(%s:%s) - XUS GET USER INFO error: %j', self.config.host, self.config.port, error);
                    return callback(error, result);
                }

                self.logger.debug('RpcClient.divisionCommand(%s:%s) - XUS GET USER INFO received: %j', self.config.host, self.config.port, result);
                var userInfo = result.split('\r\n');
                var divisionInfo = userInfo[3].split('^');

                if (String(divisionInfo[2]) === division) {
                    return callback(null, division);
                } else {
                    return callback('Selected division not found for this user', result);
                }
            });
        } else {
            // Delete the first and last array element to remove the count and rpc broker footer
            // and only get division responses
            var divisions = result.split('\r\n');
            divisions.splice(0, 1);
            divisions.splice(divisions.length - 1, 1);

            // List of divisions call was successful, verify requested division is in the list
            var divisionFound = divisions.some(function(response) {
                var pieces = response.split('^');
                if (String(pieces[2]) === division) {
                    self.logger.debug('RpcClient.divisionCommand(%s:%s) - Requested division found for this user', self.config.host, self.config.port);
                    return true;
                }
            });

            if (divisionFound) {
                var setDivisionrpcString = RpcSerializer.buildRpcString('XUS DIVISION SET', RpcParameter.literal(division));
                self.sender.send(setDivisionrpcString, function divisionSetCallback(error, result) {
                    if (error) {
                        self.logger.debug('RpcClient.divisionCommand(%s:%s) - Set division error: %j', self.config.host, self.config.port, error);
                        return callback(error, result);
                    }

                    self.logger.debug('RpcClient.divisionCommand(%s:%s) - Set division received: %j', self.config.host, self.config.port, result);
                    if (result === '0') {
                        // Unable to set division
                        return callback('Unable to set requested division', result);
                    }
                    return callback(null, division);
                });
            } else {
                return callback('Selected division not found for this user', result);
            }
        }

    });
};

RpcClient.prototype.contextCommand = function contextCommand(callback) {
    var self = this;
    self.logger.debug('RpcClient.contextCommand(%s:%s)', self.config.host, self.config.port);

    var context = this.config.context;
    var rpcString = RpcSerializer.buildRpcString('XWB CREATE CONTEXT', RpcParameter.encrypted(context));
    this.sender.send(rpcString, function contextCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.contextCommand(%s:%s) error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.contextCommand(%s:%s) received: %j', self.config.host, self.config.port, result);
        if (result !== '1') {
            return callback('Authorization error', result);
        }

        callback(null, context);
    });
};

RpcClient.prototype.signoffCommand = function signoffCommand(callback) {
    var self = this;
    self.logger.debug('RpcClient.signoffCommand(%s:%s)', self.config.host, self.config.port);

    var rpcString = RpcSerializer.buildRpcSignOffString();
    this.sender.send(rpcString, function signOffCallback(error, result) {
        if (error) {
            self.logger.debug('RpcClient.signoffCommand(%s:%s) error: %j', self.config.host, self.config.port, error);
            return callback(error, result);
        }

        self.logger.debug('RpcClient.signoffCommand(%s:%s) received: %j', self.config.host, self.config.port, result);
        callback(null, 'SIGNOFF SUCCESSFUL');
    });
};


///////////////////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////////////////

/*
Variadic function:
First: if the first parameter is an instance of a client
(i.e. it has functions named 'connect', 'execute', and 'close'),
then the signature is:
callRpc(client, rpc, parameters, callback)

Otherwise, it is:
callRpc(logger, config, rpc, parameters, callback)

The last parameter must *always* be a callback.

the rpc parameter must *always be present.

Parameters can be a single parameter, or can occur any
number of times. Also, it can be an array (of parameters).
*/
function callRpc(logger, config, rpc, parameters, callback) {
    var args = _.toArray(arguments);

    if (args.length < 3) {
        throw new Error('Invalid number of arguments passed to callRpc()');
    }

    if (!(_.last(args) instanceof Function)) {
        throw new Error('No callback function was passed to callRpc()');
    }

    var client;
    if (isClient(_.first(args))) {
        client = args.shift();
        logger = client.logger;
    } else {
        client = new RpcClient(args.shift(), args.shift());
    }

    var startTime = Date.now();

    callback = args.pop();
    rpc = args.shift();
    parameters = args;
    logger.debug('callRpc(%s:%s) rpc: %s parameters: %j', config.host, config.port, rpc, parameters);

    client.connect(function(error) {
        if (error) {
            logger.debug('error: %j', error);
            client.close();
            return callback(error);
        }

        client.execute(startTime, rpc, parameters, function(error, result) {
            client.close();
            return callback(error, result);
        });
    });
}


/*
Variadic function:
First: if the first parameter is an instance of a client
(i.e. it has functions named 'connect', 'execute', and 'close'),
then the signature is:
callRpc(client, rpc, parameters, callback)

Otherwise, it is:
authenticate(logger, config, callback)

The last parameter must *always* be a callback.
*/
function authenticate(logger, config, callback) {
    var args = _.toArray(arguments);

    callback = args.pop();
    var client;
    if (isClient(_.first(args))) {
        client = args.shift();
        logger = client.logger;
    } else {
        client = new RpcClient(args.shift(), args.shift());
    }

    logger.debug('RpcClient.authenticate(%s:%s)', config.host, config.port);
    var authError;
    var authResult;

    var startTime = Date.now();

    client.connect(function(error, result) {
        authError = error;
        authResult = result;

        logMetrics(logger, config, 'AUTHENTICATE', startTime);
        client.close();
        callback(authError, authResult);
    });
}


function isClient(obj) {
    if (_.isEmpty(obj)) {
        return false;
    }

    var funcList = ['connect', 'execute', 'close'];
    return _.every(funcList, function(funcName) {
        return _.isFunction(obj[funcName]);
    });
}


module.exports.RpcClient = RpcClient;
RpcClient.callRpc = callRpc;
RpcClient.authenticate = authenticate;
RpcClient.isClient = isClient;