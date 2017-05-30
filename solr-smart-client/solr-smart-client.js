'use strict';

/*
This class handles connecting to ZooKeeper, looking up and connecting to a Solr server,
and performing operations against that server. This class automatically connects to
ZooKeeper, and will attempt to reconnect if ZooKeeper goes down. In the event that the
SolrSmartClient cannot connect to ZooKeeper within the timeout period, it will return
an error in the callback.

Currently, this implementation does not listen for (ZooKeeper) node events, as it does
not appear to be necessary given the current requirements.

Note that it is not necessary to pass a value for the 'agent' parameter in the constructor
function or for either of the factory functions. In this case, no Keep-alive Agent will be
used.
*/


var _ = require('underscore');
var solrClient = require('solr-client');
var zookeeper = require('node-zookeeper-client');

var DEFAULT_TIMEOUT_MILLIS = 5000;
var DEFAULT_PATH = '/live_nodes';


/*
logger - a bunyan type logger
config - the connection and configuration properties
agent - HTTP Agent which is used for pooling sockets used in HTTP(s) client requests
        This parameter is optional
coreName - name of the Solr core

config should be an object as follows:

var config = {
    timeoutMillis: 5000, // optional property defaults to 5000
    core: 'vpr',
    zooKeeperConnection: 'localhost:2183,localhost:2182,localhost:2181',
    path: '/live_nodes' // optional property defaults to '/live_nodes'
};
*/
function SolrSmartClient(logger, config, agent) {
  logger.debug('solr-smart-client.SolrSmartClient()');

  this.logger = logger;
  this.config = config;
  this.agent = agent;


  //This wrapper object allows zkClient to be passed by reference
  // from parent to child and child to parent.
  //This way, the parent and child instances all share the same zookeeper connection.
  this.zkWrapper = {
    zkClientReady: false,
    zkClient: null
  };
}

SolrSmartClient.prototype.childInstance = function(childLog) {
  var child = new SolrSmartClient(childLog, this.config, this.agent);
  child.zkWrapper = this.zkWrapper;

  return child;
};

/*
Add a document or a list of documents

docs - document or list of documents to add into the Solr database
callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.add = function(docs, callback) {
  this.logger.debug('solr-smart-client.add(): %j', docs);
  this._executeSolrCommand('add', docs, callback);
};


/*
Delete all documents

callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.deleteAll = function(callback) {
  this.logger.debug('solr-smart-client.deleteAll()');
  this._executeSolrCommand('deleteByQuery', '*:*', callback);
};


/*
Delete documents matching the given `query`

query - solr query
callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.deleteByQuery = function(query, callback) {
  this.logger.debug('solr-smart-client.deleteByQuery(%s)', query);
  this._executeSolrCommand('deleteByQuery', query, callback);
};


/*
Search documents matching the `query`

query - solr query
callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.search = function(query, callback) {
  this.logger.debug('solr-smart-client.search(%s)', query);
  this._executeSolrCommand('search', query, callback);
};


/*
Send an arbitrary HTTP GET request to Solr on the specified `handler` (as Solr like to call it i.e path)

handler - a Solr path
query - Solr query
callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.get = function(handler, query, callback) {
  this.logger.debug('solr-smart-client.get(%s, %s)', handler, query);
  this._executeSolrCommand('get', [handler, query], callback);
};


/*
Commit last added and removed documents, that means your documents are now indexed.
This isn't strictly necessary for normal operations, but committing updates will
cause them to be applied more immediately (this will likely be necessary for integration
tests which involve data being updated in Solr).

callback - a function executed when the Solr server responds or an error occurs
*/
SolrSmartClient.prototype.commit = function(callback) {
  this.logger.debug('solr-smart-client.commit()');
  this._executeSolrCommand('commit', callback);
};


/*
Variadic function:
function executeSolrCommand(operation, callback)
function executeSolrCommand(operation, param, callback)
function executeSolrCommand(operation, [param1, param2...], callback)

operation - name of the operation to call on solrClient (e.g. solrClient.add(), etc.)
params - a single parameter or an array of parameters to pass to solrClient
callback - the function(error, result) called on success or failure of the solr action
*/
SolrSmartClient.prototype._executeSolrCommand = function(operation, params, callback) {
  this.logger.debug('solr-smart-client._executeSolrCommand() -> solrClient.%s(%s)', operation, params);

  if (arguments.length < 3) {
    callback = params;
    params = [];
  }

  if (!_.isArray(params)) {
    params = [params];
  }

  // slice() makes a shallow copy of the array
  params = params.slice();
  params.push(callback);

  this.logger.debug('solr-smart-client._executeSolrCommand() -> solrClient.%s()', operation);
  this._getValidSolrClient(function(error, solrClient) {
    if (error) {
      return callback(error);
    }

    var func = solrClient[operation];
    if (!_.isFunction(func)) {
      return callback('"' + operation + '" is not a valid function for the Solr Client');
    }

    return func.apply(solrClient, params);
  });
};


/*
Returns a valid SolrClient ready to invoke various Solr operations
*/
SolrSmartClient.prototype._getValidSolrClient = function(callback) {
  this.logger.debug('solr-smart-client._getValidSolrClient()');

  var self = this;
  this._getSolrNodes(function(error, liveNodes) {
    if (error) {
      return callback(error);
    }

    var solrConfig = createSolrClientConfig(self.config.core, self.agent, liveNodes);
    self.logger.info('solr-smart-client._getValidSolrClient(): SolrClient config: %j', copyWithout(solrConfig, 'agent'));

    return callback(null, solrClient.createClient(solrConfig));
  });
};


/*
Get a reference to a valid (i.e. ready to use) ZooKeeper client.

This function will look at the status
*/
SolrSmartClient.prototype._getZookeeperClient = function(callback) {
  this.logger.debug('solr-smart-client.getClient()');

  var client;
  var clientIsNull = (this.zkWrapper.zkClient === null);
  this.logger.debug('solr-smart-client._getZookeeperClient(): zkClient %s null', (clientIsNull ? 'is' : 'is not'));
  if (clientIsNull) {
    this.logger.debug('solr-smart-client._getZookeeperClient(): create client and register zookeeper event handler');
    client = zookeeper.createClient(this.config.zooKeeperConnection);
    client.on('state', this._handleZooKeeperEvent.bind(this, client));
    client.connect();
  }

  var self = this;
  var startTime = Date.now();
  // invoked immediately via IIFE
  // recursively loop until zkClientReady === true or timeout expires
  (function waitForClientReady() {
    self.logger.debug('solr-smart-client._getZookeeperClient() -> waitForClientReady(): waiting for zkClient ready');
    var timeoutMillis = self.config.timeoutMillis || DEFAULT_TIMEOUT_MILLIS;
    if (!self.zkWrapper.zkClientReady) {
      if (Date.now() - startTime > timeoutMillis) {
        self._closeZooKeeperConnection();
        return setTimeout(callback, 0, 'Timeout waiting for ready zookeeper client');
      }

      return setTimeout(waitForClientReady, 10);
    }

    return setTimeout(callback, 0, null, self.zkWrapper.zkClient);
  })();
};


/*
Handler the events sent by the ZooKeeper client. This function will update the SolrSmartClient
class to accurately reflect the state of the ZooKeeper connection, creating a new client if
one does not exist, and disposing of the current one when the connection closes or expires.

Note that the state object also includes the following values (which are not currently handled):
  AUTH_FAILED
  SASL_AUTHENTICATED
*/
SolrSmartClient.prototype._handleZooKeeperEvent = function(client, state) {
  this.logger.debug('solr-smart-client._handleZooKeeperEvent(): State: %s', state.name);
  if (state === zookeeper.State.SYNC_CONNECTED || state === zookeeper.State.CONNECTED_READ_ONLY) {
    this.logger.debug('solr-smart-client._handleZooKeeperEvent(): Connected to ZooKeeper');
    this.zkWrapper.zkClient = client;
    this.zkWrapper.zkClientReady = true;
    return;
  }

  if (state === zookeeper.State.DISCONNECTED) {
    this.logger.debug('solr-smart-client._handleZooKeeperEvent(): Disconnected from ZooKeeper');
    this._closeZooKeeperConnection();
    return;
  }

  if (state === zookeeper.State.EXPIRED) {
    this.logger.debug('solr-smart-client._handleZooKeeperEvent(): Expired by ZooKeeper');
    this._closeZooKeeperConnection();
    return;
  }
};


/*
Get all of the Solr nodes (i.e the Solr connection entries) in ZooKeeper at the node
given in the path attribute of the configuration object.
*/
SolrSmartClient.prototype._getSolrNodes = function(callback) {
  this.logger.debug('solr-smart-client._getSolrNodes()');

  var self = this;
  this._getZookeeperClient(function(error, client) {
    if (error) {
      self.logger.debug('solr-smart-client._getSolrNodes() callback, error: %j', error);
      return callback(error);
    }

    if (!client) {
      self.logger.error('solr-smart-client._getSolrNodes() callback, error: ZkClient is null');
      return callback('ZkClient is null');
    }

    self.logger.debug('solr-smart-client._getSolrNodes() callback, getting children');

    var path = self.config.path || DEFAULT_PATH;
    client.getChildren(path, function(error, children) {
      self.logger.debug('solr-smart-client._getSolrNodes(%s): callback', path);
      if (error) {
        self.logger.error('solr-smart-client._getSolrNodes(%s): callback, error: %s', path, error);
        return callback(error);
      }

      self.logger.debug('solr-smart-client._getSolrNodes(%s): callback, children: %s', path, children);
      return callback(null, children);
    });
  });
};


/*
Quietly close the ZooKeeper connection and update the state of SolrSmartClient to
reflect that.
*/
SolrSmartClient.prototype._closeZooKeeperConnection = function() {
  this.logger.debug('solr-smart-client._closeZooKeeperConnection()');

  var client = this.zkWrapper.zkClient;
  if (client !== null) {
    client.removeAllListeners();
    client.close();
  }

  this.zkWrapper = {
    zkClientReady: false,
    zkClient: null
  };
};


/* ************************************************************************************************************** */
/*                                                Factory Functions                                               */
/* ************************************************************************************************************** */

/*
logger - a bunyan type logger
config - the connection and configuration properties
agent - HTTP Agent which is used for pooling sockets used in HTTP(s) client requests
        This parameter is optional
coreName - name of the Solr core

config should be an object as follows:

var config = {
    timeoutMillis: 5000, // optional property defaults to 5000
    core: 'vpr',
    zooKeeperConnection: 'localhost:2183,localhost:2182,localhost:2181',
    path: '/live_nodes' // optional property defaults to '/live_nodes'
};
*/
function createClient(logger, config, agent) {
  logger.debug('solr-smart-client.createClient(%s)', config);

  return new SolrSmartClient(logger, config, agent);
}


/*
This function maintains backwards compatibility. Use createClient() instead.

coreName - the Solr core (e.g. 'vpr')
zooKeeperConnection - a comma-delimited list of address:port combinations
        (e.g. 'localhost:2183,localhost:2182,localhost:2181')
logger - a bunyan-style logger
agent - the keep-alive agent for the solr connection
        This parameter is optional
*/
function initClient(coreName, zooKeeperConnection, logger, agent) {
  logger.debug('solr-smart-client.initClient(%s, %s)', coreName, zooKeeperConnection);

  var config = {
    timeoutMillis: 5000,
    core: coreName,
    zooKeeperConnection: zooKeeperConnection,
    path: '/live_nodes'
  };

  return createClient(logger, config, agent);
}

/* ************************************************************************************************************** */
/*                                                Utility Functions                                               */
/* ************************************************************************************************************** */


/*
Generate a Solr client config object or return undefined if no valid liveNode string exists.
core - the Solr 'core' (e.g. 'vpr');
agent - a reference to the agent object (i.e. the KeepAliveAgent)
        This value can be 'undefined' in which case, no agent will be used.
liveNodes - a string or an array of strings, with each value being of one of the forms:
        http://127.0.0.1:8983/solr
        127.0.0.1:8983/solr
        http://localhost:8983/solr
        localhost:8983/solr

Note that the protocol is accepted and if it exists, will be used to set the 'secure' property.
In this case, secure will be set as a boolean value based on the test: protocol === 'https'. In
all other cases, secure will be a boolean value of 'false'.

If this function was called with createSolrClientConfig('vpr', {}, ['127.0.0.1:8983/solr']), the
return value would be:

var config = {
  host: '127.0.0.1',
  port: '8983',
  path: '/solr',
  secure: false,
  core: 'vpr',
  agent: {} // the agent object
}
*/
function createSolrClientConfig(core, agent, liveNodes) {
  if (_.isString(liveNodes)) {
    liveNodes = [liveNodes];
  }

  if (_.isEmpty(core) || !_.isArray(liveNodes)) {
    return;
  }

  // Go to: https://regex101.com/#javascript and enter this regex to explore...
  // This regex matches urls of the forms with or without the protocol:
  //    127.0.0.1:8983_solr
  //    127.0.0.1:8983/solr
  var urlRegex = new RegExp(/(([a-zA-Z]+)\:\/\/)?((\d+\.\d+\.\d+\.\d+)|(\S+))\:([0-9]{1,5})(\/.*|\_.*)/);
  var parsedUrl;

  // loop to find first match (i.e. first result that returns an array)
  _.find(liveNodes, function(liveNode) {
    parsedUrl = urlRegex.exec(liveNode);
    return _.isArray(parsedUrl);
  });

  // parsedUrl[2]: protocol (e.g. 'http')
  // parsedUrl[3]: host (e.g. '127.0.0.1' or 'localhost')
  // parsedUrl[6]: port
  // parsedUrl[7]: raw path (underscores probably exist in place of forward-slashes)

  if (!_.isArray(parsedUrl)) {
    return;
  }

  return {
    host: parsedUrl[3],
    port: parsedUrl[6],
    path: parsedUrl[7].replace(/_/g, '/'), // replace underscores with forward-slashes
    secure: parsedUrl[2] === 'https',
    core: core,
    agent: agent
  };
}


/*
This function performs a shallow clone of an object, omitting any properties
with names that eactly match any of the names of the excluded properties list.

object - the object to copy.
excludedProperties - a string or an array of strings of property names to
        exclude in the copy.
*/
function copyWithout(object, excludedProperties) {
  if (_.isUndefined(excludedProperties) || _.isNull(excludedProperties)) {
    return _.clone(object);
  }

  if (!_.isArray(excludedProperties)) {
    excludedProperties = [excludedProperties];
  }

  var copy = _.reduce(object, function(result, value, key) {
    if (!_.contains(excludedProperties, key)) {
      result[key] = value;
    }

    return result;
  }, {});

  return copy;
}


SolrSmartClient._createSolrClientConfig = createSolrClientConfig;
SolrSmartClient._copyWithout = copyWithout;

exports.SolrSmartClient = SolrSmartClient;
exports.initClient = initClient;
exports.createClient = createClient;