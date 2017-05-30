'use strict';

var _ = require('lodash');
var fetchList = require('./clinics-newloc-fetch-list');
var rpcClientFactory = require('../../utils/rpc-client-factory');
var rdk = require('./../../../../core/rdk');
var http = rdk.utils.http;


describe('Picklist: clinics-newloc-fetch-list - callRpcRecursively', function() {

    var callRpcRecursively = _.partial(fetchList._callRpcRecursively, {
        debug: _.noop
    }, {
        jdsServer: {}
    });

    var execute;
    var get = [];
    var store = [];
    var index = 0;
    var getStub;


    /**
     * Will create a rpcString and response data to match the string
     * @param {String} str Any random name
     * @param {Number} [repeat] The number of times to repeat the entry for that name
     */
    function createData(str, repeat) {
        var rpcString = '';
        repeat = repeat || 1;

        for (var i = 0; i < repeat; i++) {
            rpcString += index + '^' + str + '\r\n';
            var item = _.set({}, 'data.items[0]', {
                displayName: str.toUpperCase(),
                name: str,
                uid: 'uid:' + index
            });

            addResponse(null, 200, item);
            index++;
        }

        return rpcString;
    }

    /**
     * Save the response into the queue
     */
    function addResponse(err, code, response) {
        get.push({
            err: err || null,
            code: code || null,
            response: response || null
        });
    }

    beforeEach(function() {
        index = 0;
        execute = {
            err: null,
            response: null
        };
        get = [];
        store = [];

        sinon.stub(rpcClientFactory, 'getClient').returns({
            execute: function(str, searchString, order, callback) {
                if (_.isArray(execute)) {
                    var item = execute.shift();
                    return callback(item.err, item.response);
                }
                return callback(execute.err, execute.response);
            }
        });

        getStub = sinon.stub(http, 'get').callsFake(function(options, callback) {
            var response = get.shift();
            store.push(response);
            return callback(response.err, response.code, response.response);
        });

    });

    it('returns error when rcp execute fails', function(done) {
        var error = 'The RCP client failed to execute';

        _.set(execute, 'err', {
            message: error
        });

        callRpcRecursively([], '', function(err) {
            expect(err).to.equal(error);
            done();
        });
    });

    it('returns an error when jds call returns error', function(done) {
        var error = 'Dude the website is down';
        _.set(execute, 'response', '1^a');
        addResponse(error);

        callRpcRecursively([], '', function(err) {
            expect(err).to.equal(error);
            done();
        });
    });

    it('completes a simple single item scenario', function(done) {
        var str = createData('apple');

        _.set(execute, 'response', str);

        callRpcRecursively([], '', function(err, response) {
            expect(err).to.be.empty();
            expect(response).to.not.be.empty();

            expect(response.length).to.be(1);

            var requestData = getStub.getCall(0).args[0];
            expect(requestData.url).to.be('/data/urn:va:location:mySite:0');

            var item = response[0];
            var itemOne = _.get(store, '[0].response.data.items[0]');
            expect(item.displayName).to.equal(_.get(itemOne, 'displayName'));
            expect(item.name).to.equal(_.get(itemOne, 'name'));
            expect(item.uid).to.equal(_.get(itemOne, 'uid'));
            done();
        }, {
            site: 'mySite'
        });
    });

    it('ignores continues when jds returns a 404 in response.error.code', function(done) {
        var str = createData('apple');
        str += createData('banana');

        _.set(get, '[0].response.error.code', 404);
        _.set(execute, 'response', str);

        callRpcRecursively([], '', function(err, response) {
            expect(err).to.be.empty();
            expect(response).to.not.be.empty();

            expect(response.length).to.be(1);

            var requestData = getStub.getCall(0).args[0];
            expect(requestData.url).to.be('/data/urn:va:location:mySite:0');

            var item = response[0];
            var itemOne = _.get(store, '[1].response.data.items[0]');
            expect(item.displayName).to.equal(_.get(itemOne, 'displayName'));
            expect(item.name).to.equal(_.get(itemOne, 'name'));
            expect(item.uid).to.equal(_.get(itemOne, 'uid'));

            expect(getStub.calledTwice).to.be(true);
            done();
        }, {
            site: 'mySite'
        });
    });

    it('returns an error when response.error.code is not 404', function(done) {
        var error = 'Dude the website is down';
        var str = createData('apple');
        str += createData('banana');

        _.set(get, '[0].response.error.code', 500);
        _.set(get, '[0].response.error.message', error);
        _.set(execute, 'response', str);

        callRpcRecursively([], '', function(err, response) {
            expect(err).to.not.be.empty();
            expect(response).to.be.undefined();
            expect(err.message).to.equal(error);
            expect(err.code).to.equal(500);
            expect(getStub.calledOnce).to.be(true);
            done();
        }, {
            site: 'mySite'
        });
    });

    it('recurses three times', function(done) {
        // greater than 44 times
        var first = createData('apple', 50);

        // exactly 44 times
        var second = createData('banana', 44);

        // less than 44 times
        var third = createData('cranberry', 10);

        var totalItems = 50 + 44 + 10;

        execute = [
            _.set({}, 'response', first),
            _.set({}, 'response', second),
            _.set({}, 'response', third)
        ];

        callRpcRecursively([], '', function(err, response) {
            expect(err).to.be.empty();
            expect(response).to.not.be.empty();
            expect(response.length).to.be(totalItems);

            expect(response[0].name).to.equal('apple');
            expect(response[55].name).to.equal('banana');
            expect(_.last(response).name).to.equal('cranberry');

            done();
        }, {
            site: 'mySite'
        });
    });

    it('recurses three times with 404s', function(done) {
        // greater than 44 times
        var first = createData('apple', 50);

        // exactly 44 times
        var second = createData('banana', 44);

        // less than 44 times
        var third = createData('cranberry', 6);

        _.each(get, function(val, i) {
            if (i % 5 === 0) {
                _.set(val, 'response.error.code', 404);
            }
        });

        var totalItems = 100;
        var invalidItems = 20;

        execute = [
            _.set({}, 'response', first),
            _.set({}, 'response', second),
            _.set({}, 'response', third)
        ];

        callRpcRecursively([], '', function(err, response) {
            expect(err).to.be.empty();
            expect(response).to.not.be.empty();
            expect(response.length).to.be(totalItems - invalidItems);

            done();
        });
    });

});