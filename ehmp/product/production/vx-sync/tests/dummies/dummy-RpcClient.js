'use strict';

function RpcClient(logger, config) {
    this.logger = logger;
    this.config = config;
    this.error = null;
    this.response = null;
}

//----------------------------------------------------------------------------------------------------------
// This method is used to set up an error and response that the called function should return.
//
// error: The error that should be returned.
// response: The response that should be returned.
//----------------------------------------------------------------------------------------------------------
RpcClient.prototype.setErrorAndResponse = function(error, response){
    var self = this;
    self.error = error;
    self.response = response;
};

RpcClient.create = function create(logger, config) {
    return new RpcClient(logger, config);
};


// Send the greeting, signonSetup, verifyLogin and setContext commands.
//
// The callback will be called with the parameters:
//    callback(error, loginInfo)
RpcClient.prototype.connect = function connect(callback) {
    var self = this;
    return setTimeout(callback, 0, self.error, self.response);
};


RpcClient.prototype.createSender = function() {};


RpcClient.prototype.execute = function execute(rpcCall, params, callback) {
    var self = this;
    setTimeout(callback, 0, self.error, self.response);
};


RpcClient.prototype.close = function close(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, self.response);
};


RpcClient.prototype.greetingCommand = function greetingCommand(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, 'HANDSHAKE SUCCESSFUL');
};

RpcClient.prototype.signonCommand = function signonCommand(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, 'SIGNON SETUP SUCCESSFUL');
};

RpcClient.prototype.verifyCommand = function verifyCommand(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, self.response);
};

RpcClient.prototype.contextCommand = function contextCommand(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, self.response);
};

RpcClient.prototype.signoffCommand = function signoffCommand(callback) {
    var self = this;
    setTimeout(callback, 0, self.error, 'SIGNOFF SUCCESSFUL');
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
    var error = null;
    var rpcResult = null;
    setTimeout(callback, 0, error, rpcResult);
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
    var authResult = null;
    setTimeout(callback, 0, null, authResult);
}


function isClient() {
    return true;
}


module.exports.RpcClient = RpcClient;
RpcClient.callRpc = callRpc;
RpcClient.authenticate = authenticate;
RpcClient.isClient = isClient;