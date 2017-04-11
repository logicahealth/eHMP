'use strict';

var RpcClient = require('vista-js').RpcClient;
var cache = require('memory-cache');

var CACHE_TIME_OUT_FIVE_MIN = 300000;
/**
 * Returns a RpcClient instance for a site.  All calls can use the same site connection for pick lists because:
 *
 * 1. The VistaJs no_reconnect flag is not set and should not be set for any pick list resource.  This allows the
 *    RpcClient to reconnect to Vista if the connection is dropped.
 * 2. Always using proxy users from the configuration.  If this is ever changed then a new RpcClient must be created per
 *    user.
 * 3. RpcClient.close is never called.  This leaves the connection open for reuse.  We will allow Vista to timeout the
 *    connection on the Vista server side.
 * 4. RpcClient.execute is used to make the RPC call.  RpcClient uses a queue and processes the queue serially one at a
 *    time.  This is ok since in most cases data is cached. In cases where the data is not cached the connection time is
 *    the biggest performance problem. So multiple calls should process quickly on one connection.
 *
 *    If we notice performance problems in the future we can use a connect pool here to create multiple connections.
 *    This should only be done if and only if we confirm that this is the actual problem aka do not pre-optimize this.
 */
module.exports.getClient = function(logger, config) {
    var cachedResponse = cache.get(config.host);
    if (cachedResponse) {
        return cachedResponse;
    }

    var rpcClient = RpcClient.create(logger, config);
    cache.put(config.host, rpcClient, CACHE_TIME_OUT_FIVE_MIN);

    return rpcClient;
};
