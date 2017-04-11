::: page-description
HTTP Wrapper
============
:::

The HTTP wrapper is a utility that makes it easy to make HTTP calls to external systems. It wraps the [request library](https://github.com/request/request) with logging, metrics and some other convenience functionality.

The HTTP wrapper exports the following functions: `get`, `post`, `put` and `delete`, called like `rdk.utils.http.get(options, callback)`. It also can be called directly, e.g. `rdk.utils.http(options, callback)`. In this case `options.method` must be populated with the desired HTTP method.

## The `options` Parameter

The `options` parameter may have the following properties:

* `options.url`: the URL to make the request to, including the protocol. **Required.**
* `options.logger`: a logger object with standard logging calls (`trace`, `debug`, `info`, `warn`, `error`, `fatal`). **Required.**
* `options.method`: the HTTP method for the request. Required if calling this wrapper directly instead of using one of the convenience functions like `get`, `put`, `post` and `delete`.
* `options.timeout`: the request timeout in milliseconds. Defaults to 120,000.
* `options.cacheTimeout`: if provided to the `get` function, successful responses are cached for the specified number of milliseconds. Subsequent calls with the same options return the cached response instead of making the request again.
* `options.body`: a request body to send to the server. May be a string, a [Buffer](https://nodejs.org/api/buffer.html) or an object. If `options.body` is an object then the request behaves as if the `options.json` flag is true.
* `options.json`: if true, sends the request with a content-type of `application/json` and parses the response body as a JSON object.

The `options` parameter also supports all other properties that [request supports](https://github.com/request/request#requestoptions-callback).

## The `callback` Parameter

The `callback` parameter is a function handles the response from the server. The callback function's parameters are an `error`, the `response` object, and the returned `body` text: `var callback = function(error, response, body) {..};`

* `error`: any error that was encountered while trying to make the HTTP request. If the `error` parameter is truthy then the `response` and `body` parameters will likely be undefined.

* `response`: a response object of type [httpIncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage). Often `response.statusCode` is of interest. May be undefined if `error` is truthy.

* `body`: the returned response, as a JSON object if `options.json` was true, or as a string otherwise. May be undefined if `error` is truthy.

## Example

    var options = {
      url: 'http://some.url/and/path',
      logger: req.logger,
      body: sendThisObject
    }
    rdk.utils.http.post(options, function(error, response, body) {
      if (error) {
        return res.status(500).rdkSend(error);
      }
      return res.status(response.statusCode).rdkSend(body);
    });

Note that in this example the returned `body` is a JSON object, since `options.body` is also an object.
