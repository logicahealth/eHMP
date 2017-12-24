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


const _ = require('underscore');
const solrClientModule = require('solr-client');
const zookeeper = require('node-zookeeper-client');

const CHILD_INSTANCE_ENABLED = true;
const DATA_TIMEOUT_MILLIS = 30000;
const WAIT_LOOP_DELAY_MILLIS = 100;
const REQUERY_LOOP_DELAY_MILLIS = 1000;
const CORE = 'vpr';
const PATH = '/collections/vpr/state.json';
const NODE_EVENT_LOG_LEVEL = 'debug';
const ZOOKEEPER_EVENT_LOG_LEVEL = 'debug';

/*
Variadic Function:
function SolrSmartClient(logger, config, agent, parentDataWrapper)
function SolrSmartClient(logger, config, agent)

IMPORTANT: If you manually create an instance of SolrSmartClient directly by using this constructor,
you MUST call start() for the SolrSmartClient instance to connect to Zookeeper.

logger - a bunyan type logger
config - the connection and configuration properties
agent - HTTP Agent which is used for pooling sockets used in HTTP(s) client requests
        This parameter is optional
parentDataWrapper = optional object. If a value is passed then this is a child instance and
        it will not attempt any connection management (as that is handled by the parent)
        and will only return data. This parameter should only be passed when the constructor
        is called by the childInstance() method.

config should be an object as follows:

let config = {
  childInstanceEnabled, // if false, childInstance() returns "this"
  dataTimeoutMillis, // the amount of time to wait for ZooKeeper data
  waitLoopDelayMillis, // the amount of time between each loop when waiting for valid data
  requeryLoopDelayMillis, // the amount of time between each attempt to call getData() after an error
  core. // the solr core, e.g. 'vpr'
  zooKeeperConnection, // connection string for ZooKeeper, e.g. 'localhost:2183,localhost:2182,localhost:2181'
  path, // ZooKeeper path to node with cluster status
  nodeEventLogLevel, // bunyan log level at which ZooKeeper Node Events will be logged
  zookeeperEventLogLevel, // bunyan log level at which ZooKeeper Events will be logged
  zooKeeperOptions: { // this node and all of the values it contains are optional
    spinDelay: // a millisecond value - zookeeper client will default to 1000
    sessionTimeout: // a millisecond value - zookeeper client will default to 30000
    retries: // zookeeper client will default to 0 - SEE BELOW BEFORE SETTING THIS
    sessionId: // zookeeper client will default to undefined
    sessionPassword: // zookeeper client will default to undefined
  }
};

RETRIES VALUE
The Zookeeper client uses an algorithm that geometrically increases the delay between each
retry as follows:
    Math.min(1000 * Math.pow(2, attempts), sessionTimeout)
*/

class SolrSmartClient {
  constructor(logger, config, agent, parentDataWrapper) {
    if (!new.target) {
      return new SolrSmartClient(logger, config, agent, parentDataWrapper);
    }

    logger.debug('solr-smart-client.SolrSmartClient()');

    this.logger = logger;
    this.config = config;
    this.agent = agent;
    this.child = !!parentDataWrapper;
    this.zkClient = null;

    this.config.childInstanceEnabled = _.has(config, 'childInstanceEnabled') ? config.childInstanceEnabled : CHILD_INSTANCE_ENABLED;
    this.config.dataTimeoutMillis = _.has(config, 'dataTimeoutMillis') ? config.dataTimeoutMillis : DATA_TIMEOUT_MILLIS;
    this.config.waitLoopDelayMillis = _.has(config, 'waitLoopDelayMillis') ? config.waitLoopDelayMillis : WAIT_LOOP_DELAY_MILLIS;
    this.config.requeryLoopDelayMillis = _.has(config, 'requeryLoopDelayMillis') ? config.requeryLoopDelayMillis : REQUERY_LOOP_DELAY_MILLIS;
    this.config.core = config.core || CORE;
    this.config.path = config.path || PATH;
    this.config.zooKeeperConnection = config.zooKeeperConnection;
    this.config.nodeEventLogLevel = config.nodeEventLogLevel || NODE_EVENT_LOG_LEVEL;
    this.config.zookeeperEventLogLevel = config.zookeeperEventLogLevel || ZOOKEEPER_EVENT_LOG_LEVEL;
    this.config.zooKeeperOptions = config.zooKeeperOptions;


    // This wrapper object allows the Zookeeper data to be passed by reference
    // from parent to child and child to parent. This way, the parent and child
    // instances all share the same zookeeper connection.
    // IMPORTANT: Do not set these values manually! Only set them in response
    // to a Zookeeper event or a Zookeeper Node event!
    this.dataWrapper = parentDataWrapper || {
      data: undefined,
      valid: false
    };
  }


  /*
  This method creates a child instance of the current SolrSmartClient instance.
  A child instance only uses the 'dataWrapper' object and assumes that Zookeeper
  connection, event, and error handling will be performed by the parent instance.

  The purpose of this method is to allow instance-specific logging without adding
  additional Zookeeper connection overhead.

  IMPORTANT: DO NOT call start() on instances of SolrSmartClient created with this
  method. The Zookeeper connection management will be handled exclusively by the
  parent instance.
  */
  childInstance(childLogger) {
    this.logger.debug('solr-smart-client.childInstance() childInstanceEnabled? %s', this.config.childInstanceEnabled);

    if (!this.config.childInstanceEnabled) {
      this.logger.debug('solr-smart-client.childInstance() childInstanceEnabled false, returning "this"');
      return this;
    }

    return new SolrSmartClient(childLogger, this.config, this.agent, this.dataWrapper);
  }


  /*
  Add a document or a list of documents

  docs - document or list of documents to add into the Solr database
  callback - a function executed when the Solr server responds or an error occurs
  */
  add(docs, callback) {
    this.logger.debug('solr-smart-client.add(): %j', docs);
    this._executeSolrCommand('add', docs, callback);
  }


  /*
  Delete all documents

  callback - a function executed when the Solr server responds or an error occurs
  */
  deleteAll(callback) {
    this.logger.debug('solr-smart-client.deleteAll()');
    this._executeSolrCommand('deleteByQuery', '*:*', callback);
  }


  /*
  Delete documents matching the given `query`

  query - solr query
  callback - a function executed when the Solr server responds or an error occurs
  */
  deleteByQuery(query, callback) {
    this.logger.debug('solr-smart-client.deleteByQuery(%j)', query);
    this._executeSolrCommand('deleteByQuery', query, callback);
  }


  /*
  Search documents matching the `query`

  query - solr query
  callback - a function executed when the Solr server responds or an error occurs
  */
  search(query, callback) {
    this.logger.debug('solr-smart-client.search(%j)', query);
    this._executeSolrCommand('search', query, callback);
  }


  /*
  Send an arbitrary HTTP GET request to Solr on the specified `handler` (as Solr like to call it i.e path)

  handler - a Solr path
  query - Solr query
  callback - a function executed when the Solr server responds or an error occurs
  */
  get(handler, query, callback) {
    this.logger.debug('solr-smart-client.get(%j, %j)', handler, query);
    this._executeSolrCommand('get', [handler, query], callback);
  }


  /*
  Commit last added and removed documents, that means your documents are now indexed.
  This isn't strictly necessary for normal operations, but committing updates will
  cause them to be applied more immediately (this will likely be necessary for integration
  tests which involve data being updated in Solr).

  callback - a function executed when the Solr server responds or an error occurs
  */
  commit(callback) {
    this.logger.debug('solr-smart-client.commit()');
    this._executeSolrCommand('commit', callback);
  }


  /*
  Ping the server via a call to solrClient.ping()

  callback - a function executed when the Solr server responds or an error occurs
  */
  ping(callback) {
    this.logger.debug('solr-smart-client.ping()');
    this._executeSolrCommand('ping', callback);
  }


  /*
  This method creates the Zookeeper client instances and registers all event
  handlers for Zookeeper events and Zookeeper Node events. If this method is
  called from and instance created with childInstance(), it will log a warning
  message and return without doing anything.
  */
  start() {
    this.logger.debug('solr-smart-client.start()');

    if (this.child) {
      // This method was called on a child instance, so log a warning and return
      this.logger.warn('solr-smart-client.start() attempt to call this method from childInstance ignored');
      return;
    }

    let logger = this.logger;
    let dataWrapper = this.dataWrapper;
    let zooKeeperOptions = this.config.zooKeeperOptions;
    let zooKeeperConnection = this.config.zooKeeperConnection;
    let zookeeperEventLogLevel = this.config.zookeeperEventLogLevel;

    // Clear the data to start fresh
    dataWrapper.valid = false;
    dataWrapper.data = undefined;

    // Unregister all Zookeeper listeners, close the current connection
    if (this.zkClient) {
      this.zkClient.removeAllListeners();
      this.zkClient.close();
    }

    logger.debug('solr-smart-client.start() zookeeper.createClient()');
    this.zkClient = zookeeper.createClient(zooKeeperConnection, zooKeeperOptions);
    logger.debug('solr-smart-client.start() zookeeper client created');
    this.zkClient.connect();
    this.zkClient.on('state', state => {
      logger.debug('solr-smart-client.start() -> sessionId: %s, eventHandler(): %j', this.zkSessionId, state);

      // ZooKeeper events can be one of 6 states:
      //   DISCONNECTED
      //   SYNC_CONNECTED
      //   AUTH_FAILED
      //   CONNECTED_READ_ONLY
      //   SASL_AUTHENTICATED
      //   EXPIRED

      if (!_.isEmpty(zookeeperEventLogLevel) && _.isFunction(logger[zookeeperEventLogLevel])) {
        logger[zookeeperEventLogLevel]('solr-smart-client.start() -> eventHandler() sessionId: %s, Zookeeper Event: %j', this.zkSessionId, state);
      }

      if (state === zookeeper.State.SYNC_CONNECTED || state === zookeeper.State.CONNECTED_READ_ONLY) {
        return this._fetchZookeeperData();
      }

      if (state === zookeeper.State.DISCONNECTED) {
        logger.debug('solr-smart-client.start() -> eventHandler() sessionId: %s, DISCONNECTED', this.zkSessionId);
        dataWrapper.valid = false;
        dataWrapper.data = undefined;
        return;
      }

      if (state === zookeeper.State.EXPIRED) {
        logger.warn('solr-smart-client.start() -> eventHandler() sessionId: %s, EXPIRED', this.zkSessionId);

        // EXPIRED events should be uncommon. Clear out the client and reset everything.
        this.start();
      }
    });
  }


  /*
  Returns the Zookeeper SessionId as a string. If "this.zkClient"
  (the Zookeeper client instance) is null or undefined, it returns
  'undefined'.

  The value returned will be a hex value which will match up with the
  sessionId value in the Zookeeper log file.
  */
  get zkSessionId() {
    if (!this.zkClient) {
      return;
    }

    return this.zkClient.getSessionId().toString('hex');
  }


  /*
  Call zkClient.getChildren() and update the data from the results.
  Additionally, register a watcher so that in the event of a node
  being modified, added, or deleted, the data will be reloaded.
  */
  _fetchZookeeperData() {
    this.logger.debug('solr-smart-client._fetchZookeeperData()');

    let dataWrapper = this.dataWrapper;
    let logger = this.logger;
    let nodeEventLogLevel = this.nodeEventLogLevel;
    let requeryLoopDelayMillis = this.config.requeryLoopDelayMillis;


    // This is called on any of the Zookeeper Node events:
    // NODE_CREATED, NODE_DELETED, NODE_DATA_CHANGED, NODE_CHILDREN_CHANGED

    // A watch is a one-time event listener (i.e. it is called at most, one time)
    let watch = event => {
      if (!_.isEmpty(nodeEventLogLevel) && _.isFunction(logger[nodeEventLogLevel])) {
        logger[nodeEventLogLevel]('solr-smart-client._fetchZookeeperData() -> watch() sessionId: %s, Zookeeper Node Event: %j', this.zkSessionId, event);
      }

      logger.debug('solr-smart-client._fetchZookeeperData() -> watch() Zookeeper Node Event: %j', event);
      this._fetchZookeeperData();
    };

    // Save the data or the valid flag to false if an error occured when
    // attempting to call zkClient.getChildren()
    let setData = (error, clusterState) => {
      if (error) {
        logger.error('solr-smart-client._fetchZookeeperData() -> setData() Error calling zookeeper.getData(): sessionId: %s, error: %j', this.zkSessionId, error);
        dataWrapper.valid = false;
        dataWrapper.data = undefined;
        return setTimeout(this._fetchZookeeperData.bind(this), requeryLoopDelayMillis);
      }

      logger.debug('solr-smart-client._fetchZookeeperData() -> setData() sessionId: %s, clusterState: %s', this.zkSessionId, clusterState);
      dataWrapper.valid = true;
      dataWrapper.data = clusterState;
    };

    this.zkClient.getData(this.config.path, watch, setData);
  }


  /*
  This function retrieves the SOLR client info from ZooKeeper. In the event
  that data has not been retrieved yet, or has been cleared because ZooKeeper
  is down or because the data is being updated, the method will wait for the
  data until the config.dataTimeoutMillis period is exceeded, at which point
  it will return an error.
  */
  _getSolrClientInfo(callback) {
    this.logger.debug('solr-smart-client._getSolrClientInfo()');

    let startTime = Date.now();
    let logger = this.logger;
    let dataWrapper = this.dataWrapper;
    let dataTimeoutMillis = this.config.dataTimeoutMillis;
    let waitLoopDelayMillis = this.config.waitLoopDelayMillis;

    // invoked immediately via IIFE
    // recursively loop until dataWrapper.valid or timeout expires
    (function waitForValidData() {
      logger.debug('solr-smart-client._getSolrClientInfo() -> waitForValidData(): waiting for dataWrapper.valid: %s', dataWrapper.valid);
      if (!dataWrapper.valid) {
        if (Date.now() - startTime > dataTimeoutMillis) {
          logger.warn('solr-smart-client._getSolrClientInfo() -> waitForValidData(): timeout while waiting for valid data');
          return setTimeout(callback, 0, 'Timeout waiting for valid zookeeper data');
        }

        return setTimeout(waitForValidData, waitLoopDelayMillis);
      }

      logger.debug('solr-smart-client._getSolrClientInfo() -> waitForValidData(): retrieved valid data: %s', dataWrapper.data);
      return setTimeout(callback, 0, null, dataWrapper.data);
    })();
  }


  /*
  Variadic function:
  function executeSolrCommand(operation, callback)
  function executeSolrCommand(operation, param, callback)
  function executeSolrCommand(operation, [param1, param2...], callback)

  operation - name of the operation to call on solrClient (e.g. solrClient.add(), etc.)
  params - a single parameter or an array of parameters to pass to solrClient
  callback - the function(error, result) called on success or failure of the solr action

  This function executes a solr command, first performing all of the necessary operations
  to get a reference to a valid solr client instance. The following solr command methods
  in this class delegate to this method:

    add()
    deleteAll()
    deleteByQuery()
    search()
    get()
    commit()
  */
  _executeSolrCommand(operation, params, callback) {
    this.logger.debug('solr-smart-client._executeSolrCommand() -> solrClient.%s(%j)', operation, params);

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
    this._getValidSolrClient(solrClientModule, (error, solrClientInstance) => {
      if (error) {
        return callback(error);
      }

      let func = solrClientInstance[operation];
      if (!_.isFunction(func)) {
        return callback('"' + operation + '" is not a valid function for the Solr Client');
      }

      return func.apply(solrClientInstance, params);
    });
  }


  /*
  Returns a valid SolrClient ready to invoke various Solr operations

  The solrClient parameter is to allow unit tests to pass in a custom
  solrClient library.
  */
  _getValidSolrClient(solrClientLibrary, callback) {
    this.logger.debug('solr-smart-client._getValidSolrClient()');

    let core = this.config.core;
    let agent = this.agent;
    this._getSolrClientInfo((error, solrClientInfo) => {
      if (error) {
        this.logger.warn('solr-smart-client._getValidSolrClient() error retrieving solrConfig: %j', error);
        return callback(error);
      }

      let solrConfig = SolrSmartClient._createSolrClientConfig(this.logger, core, agent, solrClientInfo);

      this.logger.info('solr-smart-client._getValidSolrClient() solrConfig: %j', _.omit(solrConfig, 'agent'));
      return callback(null, solrClientLibrary.createClient(solrConfig));
    });
  }


  /*
  Generate a Solr client config object or return undefined if no valid liveNode string exists.
  core - the Solr 'core' (e.g. 'vpr');
  agent - a reference to the agent object (i.e. the KeepAliveAgent)
          This value can be 'undefined' in which case, no agent will be used.
  clusterState - the state of the SOLR cluster stored by ZooKeeper. This should be a JSON
  document similar to:

  {
    "vpr": {
      "replicationFactor": "1",
      "shards": {
        "shard1": {
          "range": "80000000-7fffffff",
          "state": "active",
          "replicas": {
            "core_node1": {
              "core": "vpr_shard1_replica1",
              "base_url": "http://IP             /solr",
              "node_name": "IP             _solr",
              "state": "active",
              "leader": "true"
            }
          }
        }
      },
      "router": {
        "name": "compositeId"
      },
      "maxShardsPerNode": "2",
      "autoAddReplicas": "false"
    }
  }

  Note that "vpr" is the name of the collection (i.e. the core). Note that a complex system could
  have multiple shards with multiple replicas per shard. This function will find the data from the
  first shard with a replica with "state" === 'active' and "leader" === 'true'.
  */
  static _createSolrClientConfig(logger, core, agent, clusterState) {
    logger.debug('solr-smart-client._createSolrClientConfig() core: %s clusterState: %s', core, clusterState);

    if (_.isEmpty(core) || _.isEmpty(clusterState)) {
      logger.warn('solr-smart-client._createSolrClientConfig() no value for core and/or clusterState, unable to create solr client config');
      return;
    }

    try {
      clusterState = JSON.parse(clusterState);
    } catch (error) {
      logger.warn('solr-smart-client._createSolrClientConfig() error parsing clusterState, unable to create solr client config: %j', error);
      return;
    }

    if (!clusterState[core]) {
      logger.warn('solr-smart-client._createSolrClientConfig() no entry for "%s" collection, unable to create solr client config', core);
      return;
    }

    let parsedUrl = SolrSmartClient._findFirstReadyNodeUrl(logger, clusterState[core].shards);

    if (!parsedUrl) {
      logger.warn('solr-smart-client._createSolrClientConfig() unable to find ready replica to create solr client config');
      return;
    }

    return {
      secure: parsedUrl[2] === 'https',
      host: parsedUrl[3],
      port: parsedUrl[4],
      path: parsedUrl[5],
      core: core,
      agent: agent
    };
  }


  /*
  This function parses the shard and replica information (which was retrieved from the
  collections node) and finds the first replica which matches the criteria:
    state === 'active'
    leader === 'true'
    base_url that matches the regex

  The return value is the array gotten from executing the regex.

  Given the following input:

  let shards =
    "shard1": {
      "range": "80000000-7fffffff",
      "state": "active",
      "replicas": {
        "core_node1": {
          "core": "vpr_shard1_replica1",
          "base_url": "http://IP             /solr",
          "node_name": "IP             _solr",
          "state": "active",
          "leader": "true"
        }
      }
    },
    "shard2": {
      "range": "80000000-7fffffff",
      "state": "active",
      "replicas": {
        "core_node1": {
          "core": "vpr_shard2_replica1",
          "base_url": "http://IP             /solr",
          "node_name": "IP             _solr",
          "state": "active",
          "leader": "true"
        }
      }
    }
  }

  The return value would be:

  [ 'http://IP             /solr',
    'http://',
    'http',
    'IP        ',
    'PORT',
    '/solr',
    index: 0,
    input: 'http://IP             /solr' ]

  */
  static _findFirstReadyNodeUrl(logger, shards) {
    logger.debug('solr-smart-client._findFirstReadyNodeUrl() %j', shards);

    // Go to: https://regex101.com/#javascript and enter this regex to explore...
    // This regex matches urls of the forms with or without the protocol:
    //    http://127.0.0.1:PORT/solr
    let urlRegex = new RegExp(/^((http[s]?):\/\/)?(\S+):([0-9]{1,5})(\S+)/);

    // Create an array with all of the solr node entries in all of the shards that
    // are active, leaders, and with a base_url  that matches the expected pattern
    let nodeList = _.flatten(_.map(shards, shardInfo => {
      return _.filter(shardInfo.replicas, node => {
        return node.state === 'active' && node.leader === 'true' && urlRegex.test(node.base_url);
      });
    }));

    if (_.isEmpty(nodeList)) {
      logger.warn('solr-smart-client._findFirstReadyNodeUrl() no nodes were found in a valid state with valid info');
      return;
    }

    return urlRegex.exec(_.first(nodeList).base_url);
  }
}

/* ************************************************************************************************************** */
/*                                                Factory Functions                                               */
/* ************************************************************************************************************** */

/*
This function creates a stand-alone (i.e. not a child) instance of SolrSmartClient.

config - the connection and configuration properties
agent - HTTP Agent which is used for pooling sockets used in HTTP(s) client requests
        This parameter is optional

For full documentation on the properties in 'config', see the comments in the SolrSmartClient constructor
*/
function createClient(logger, config, agent) {
  logger.debug('solr-smart-client.createClient() config: %j', config);

  let solrSmartClient = new SolrSmartClient(logger, config, agent);
  solrSmartClient.start();

  return solrSmartClient;
}


exports.SolrSmartClient = SolrSmartClient;
exports.createClient = createClient;