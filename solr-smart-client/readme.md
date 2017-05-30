Solr-Smart-Client
=================

See inline comments for more complete documentation about this module.

Constructor Function
--------------------

`SolrSmartClient(logger, config, agent)`
Create an instance of the `SolrSmartClient`.

+ `logger` - This should be an instance of a `bunyan` style logger.
+ `config` - This is an object as follows:
```js
	var config = {
	    timeoutMillis: 5000, // optional property defaults to 5000
	    core: 'vpr',
	    zooKeeperConnection: 'localhost:2183,localhost:2182,localhost:2181',
	    path: '/live_nodes' // optional property defaults to '/live_nodes'
	};
```
+ `agent` - An instance of a KeepAliveAgent. This can be omitted, in which case, no agent will be used.

Instance Methods
----------------

`add(docs, callback)`
Add a document or collection of documents to SOLR.

`deleteAll(callback)`
Delete all documents from SOLR.

`deleteByQuery(query, callback)`
Delete all documents from SOLR that match the search query.

`search(query, callback)`
Search for documents in SOLR that match the search query.

`get(handler, query, callback)`
Get a document based on the search query.

`commit()`
Commit last added and removed documents.

Private Instance Methods
------------------------
These are internal to the operation of the SolrSmartClient and generally shouldn't be used.

`_executeSolrCommand(operation, params, callback)`

`_getValidSolrClient(callback)`

`_getZookeeperClient(callback)`

`_handleZooKeeperEvent(client, state)`

`_getSolrNodes(callback)`

`_closeZooKeeperConnection()`

Factory Functions
-----------------

`createClient(logger, config, agent)`
Create a new instance of the SolrSmartClient. This is identical to using the constructor function.

`initClient(coreName, zooKeeperConnection, logger, agent)`
This function is obsolete and is only maintained for compatibility. Instead, use 'createClient()'
to create a new instance of a SolrSmartClient (or use the constructor function).

Utility Functions
-----------------

`createSolrClientConfig(core, agent, liveNodes)`
This function is used internally and should not be used by developers.

`copyWithout(object, excludedProperties)`
This function is used internally and should not be used by developers.