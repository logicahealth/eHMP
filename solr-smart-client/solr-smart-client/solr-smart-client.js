var solrClient = require('solr-client');
var async = require('async');
/**
 * Expose `createClient()`.
 */

var zookeeper = require('node-zookeeper-client');
var solrCore = null;
var zookeeperClient = null;
var zkLiveNodes = null;

exports.initClient = initClient;

//Exports for testing purposes only
exports._SolrSmartClient = SolrSmartClient;
//exports._getOptions = getOptions;
exports.getValidSolrClient = getValidSolrClient;

var logger;

var module = this;

function initClient(core, zooKeeperConnection, log, agent) {
  logger = log;

  //console.log('logger: ' + logger);
  if (zookeeperClient === null) {
    solrCore = core;
    zookeeperClient = createZookeeperClient(zooKeeperConnection, function (err, zkClient) {
      if (err) {
        logger.error('Solr-Smart-Client: Error Creating Zookeeper Client');
        return;
      }
      else {
        zookeeperClient = zkClient;
      }
    });
  }
  return new SolrSmartClient(agent);
}


function createZookeeperClient(zookeeperConnection, callback) {

  var zookeeperClient = zookeeper.createClient(zookeeperConnection);

  zookeeperClient.on('connected', function () {
    getZkLiveNodes(zookeeperClient, function (err, result) {
      if (err) {
        logger.error('Solr-Smart-Client: getZkLiveNodes err:');
        logger.error('Solr-Smart-Client: ' + err);
        callback(err);
      }
      logger.info('Solr-Smart-Client: zookeeper connected event');
      logger.info('Solr-Smart-Client: getZkLiveNodes result:');
      logger.info(result);
      zkLiveNodes = result;
      callback(null, zookeeperClient);
    })
  });

  zookeeperClient.on('disconnected', function () {
    logger.info('Solr-Smart-Client: zookeeper disconnected event');
    //TODO: Set some error state?  Or keep using last known Solr node values?
  });

  zookeeperClient.connect();
}

/**
 * Create an instance of `solrClient`
 *
 * @param {String|Object} [host='127.0.0.1'] - IP address or host address of the Solr server
 * @param {Number|String} [port='8983'] - port of the Solr server
 * @param {String} [core=''] - name of the Solr core requested
 * @param {String} [path='/solr'] - root path of all requests
 * @param {http.Agent} [agent] - HTTP Agent which is used for pooling sockets used in HTTP(s) client requests
 * @param {Boolean} [secure=false] - if true HTTPS will be used instead of HTTP
 * @param {Boolean} [bigint=false] - if true JSONbig serializer/deserializer will be used instead
 *                                    of JSON native serializer/deserializer
 *
 * @return {solrClient}
 * @api public
 */

function SolrSmartClient(agent) {
  this.agent = agent;
}

/***
 * Necessary while explicitly needing to close zookeeper
 */
SolrSmartClient.prototype.closeZookeeper = function () {
  closeZookeeper(zookeeperClient, this.agent);
}


/***
 * Wait for the zookeeper live nodes to become valid
 * This could take some time (amount of time to establish zk connection), but should be ready for subsequent calls
 * @param seriesCallback
 */
function waitForValidNodeInfo(seriesCallback) {
  async.until(
      function () {
        return zkLiveNodes !== null;
      },
      function (callback) {
        setTimeout(function () {
          callback(null, null);
        }, 10)
      },
      function (err, result) {
        seriesCallback(null, null);
      }
  );
}

/***
 * Returns a valid SolrClient with a connected zookeeper, ready to perform actions
 * @param getClientCallback
 */
function getValidSolrClient(getClientCallback, agent) {
  async.series([

        function (seriesCallback) {
          //essentially poll until the nodes are valid
          //This could take some time (amount of time to establish zk connection), but should be ready for subsequent calls
          waitForValidNodeInfo(seriesCallback);
        },

        function (seriesCallback) {
          //update options with known solr node values
          //TODO: Do this after receiving updates from zookeeper, instead of for every request
          var options = getOptions(agent);
          logger.trace('Solr-Smart-Client: SolrClient Options:');
          logger.trace(options);
          var client = solrClient.createClient(options);

          seriesCallback(null, client);
        }
      ],
      function (err, results) {
        if (!err) {
          getClientCallback(err, results[1]);
        }
      });
}

/**
 * Add a document or a list of documents
 *
 * @param {Object|Array} doc - document or list of documents to add into the Solr database
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */
SolrSmartClient.prototype.add = function (docs, addCallback) {
  module.getValidSolrClient(function (err, solrClient) {
    if (!err) {
      return solrClient.add(docs, addCallback);
    }
  }, this.agent);
}


/**
 * Commit last added and removed documents, that means your documents are now indexed.
 *
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */
SolrSmartClient.prototype.commit = function (callback) {
  logger.debug('Solr-Smart-Client: commit called');
  //TODO: Consider no-op this, should not be a need to explicitly commit
  module.getValidSolrClient(function (err, solrClient) {
    logger.debug('Solr-Smart-Client: getValidSolrClient callback');
    if (!err) {
      logger.debug('Solr-Smart-Client: invoking solrClient.commit');
      return solrClient.commit(callback);
    }
  }, this.agent);
}

/**
 * Delete all documents
 *
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */
SolrSmartClient.prototype.deleteAll = function (callback) {
  module.getValidSolrClient(function (err, solrClient) {
    if (!err) {
      return solrClient.deleteByQuery('*:*', callback);
    }
  }, this.agent);
}


/**
 * Delete documents matching the given `query`
 *
 * @param {String} query -
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */

SolrSmartClient.prototype.deleteByQuery = function (query, callback) {
  module.getValidSolrClient(function (err, solrClient) {
    if (!err) {
      return solrClient.deleteByQuery(query, callback);
    }
  }, this.agent);
}


/**
 * Search documents matching the `query`
 *
 * @param {Query|Object|String} query
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */
SolrSmartClient.prototype.search = function (query, callback) {
  module.getValidSolrClient(function (err, solrClient) {
    if (!err) {
      return solrClient.search(query, callback);
    }
  }, this.agent);
}


/**
 * Send an arbitrary HTTP GET request to Solr on the specified `handler` (as Solr like to call it i.e path)
 *
 * @param {String} handler
 * @param {Query|Object|String} [query]
 * @param {Function} callback(err,obj) - a function executed when the Solr server responds or an error occurs
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 *
 * @return {http.ClientRequest}
 * @api public
 */
SolrSmartClient.prototype.get = function (handler, query, callback) {
  module.getValidSolrClient(function (err, solrClient) {
    if (!err) {
      return solrClient.get(handler, query, callback);
    }
  }, this.agent);
}


function getOptions(agent) {
  var options = {host: null, port: null, core: null, path: null};

  logger.trace('Solr-Smart-Client: zkLiveNodes:');
  logger.trace('Solr-Smart-Client: ' + zkLiveNodes);
  if (zkLiveNodes.length != 0) {
    var node = zkLiveNodes[0];  //just pick the first node for now
    //console.log('creating options for node: ' + node);
    //  10.0.2.15:7574/solr

    var colonDigits = /:\d+/.exec(node)[0];
    //console.log('colonDigits: ' + colonDigits);

    var colonDigitsIndex = node.indexOf(colonDigits);
    //console.log('colonDigitsIndex: ' + colonDigitsIndex);

    var host = node.substring(0, colonDigitsIndex);
    //console.log('host: ' + host);

    var port = colonDigits.substring(1, colonDigits.length);
    //console.log('port: ' + port);

    var pathIndex = node.indexOf(colonDigits) + colonDigits.length;
    //console.log('pathIndex: ' + pathIndex);

    var hostPort = node.substring(0, pathIndex);
    //console.log('hostPort: ' + hostPort);

    var path = node.substring(pathIndex);
    //console.log('path: ' + path);

    //return hostPort + path.replace(pattern, replacement);


    options.host = host;
    options.port = port;
    options.core = solrCore;
    options.path = path;
    options.agent = agent;
  }
  //parse out the live nodes to get the values

  return options;
}

function closeZookeeper(zookeeperClient, agent) {
  if (zookeeperClient !== null) {
    if (zookeeperClient.getState() !== zookeeper.State.DISCONNECTED) {
      zookeeperClient.close();
    }
  }

  //detect freesockets on a forever-agent and free the sockets when we close down
  if (agent){
    if (agent.freeSockets){
      //freeSockets contains a object, keyed by host:port, each containing array of sockets
      //iterate the host:port's, then iterate the sockets, destroying each
      //var freeSockets = VxSyncForeverAgent.freeSockets;
      var freeSockets = agent.freeSockets;
      for (var key in freeSockets) {
        if (freeSockets.hasOwnProperty(key)) {
          freeSockets[key].forEach(function(element, index, array){
            logger.info('Solr-Smart-Client: Destroying freeSocket');
            element.destroy();
          });
        }
      }
    }
  }
}

function getZkLiveNodes(client, callback) {
  /***
   * Take the result of the zookeeper call to getChildren to rebuild our list of live nodes.
   * @param error
   * @param data
   * @param stat
   */
  function processGetChildrenResult(error, data, stat) {
    if (error) {
      logger.error('Solr-Smart-Client: ' + error.stack);
      callback(error, null);
    }

    logger.info('Solr-Smart-Client: ' + data.toString('utf8'));
    var liveNodes = [];
    data.map(function (item) {
      //replace the underscore with slash to make the url legit
      liveNodes.push(replaceAfterPort(item, /_/g, '/'));
    });
    callback(null, liveNodes);

  }

  /***
   * query zookeeper for the live_nodes.  immediately process the results on the callback, but also set up a
   * watcher for future updates
   */
  client.getChildren(
      '/live_nodes',
      getChildrenWatchCallback,
      processGetChildrenResult
  );

  function getChildrenWatchCallback (event) {
    logger.info('Solr-Smart-Client: event.toString: ' + event.toString());

    if ((event.getName() === 'NODE_CHILDREN_CHANGED') && (event.getPath() === '/live_nodes')) {
      client.getChildren('/live_nodes', getChildrenWatchCallback, processGetChildrenResult);
    }
  }
}

function replaceAfterPort(url, pattern, replacement) {
  var colonDigits = /:\d+/.exec(url)[0];
  var pathIndex = url.indexOf(colonDigits) + colonDigits.length;
  var hostPort = url.substring(0, pathIndex);
  var path = url.substring(pathIndex);
  return hostPort + path.replace(pattern, replacement);
}
