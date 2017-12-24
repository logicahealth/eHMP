'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var favorites = require('../../../subsystems/orderables/favorite-orderable-subsystem');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

function noop() {}

function createReqWithParam(map) {
    map = map || {};
    var req = {
        param: (function param(map, name, defaultValue) {
            if (_.has(map, name)) {
                return map[name] !== null ? String(map[name]) : null;
            }

            if (defaultValue !== undefined && defaultValue !== null) {
                String(defaultValue);
            }

            return defaultValue;
        }).bind(null, map),

        query: map,
        logger: logger,
        audit: {},
        app: {
            config: {}
        },
        session: {
            user: {
                site: 'vistaSite',
                uid: 'userUid'
            }
        }
    };
    return req;
}

// FUTURE-TODO: Re-enable (remove .skip) once resource is fully supported/tested end-to-end by system.
describe.skip('Favorites', function() {
    var req;
    var res = {
        status: function() {
            return {
                rdkSend: noop
            };
        }
    };
    var pjdsPutOptions;
    var pjdsGetOptions;
    var pjdsDeleteOptions;
    var storedFavorite;
    var pjdsGetResult;


    beforeEach(function() {
        pjdsPutOptions = null;

        req = createReqWithParam();

        sinon.spy(res, 'status');

        sinon.stub(pjds, 'post', function(req, res, options, callback) {
            storedFavorite = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'put', function(req, res, options, callback) {
            storedFavorite = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'get', function(req, res, options, callback) {
            callback(null, pjdsGetResult);
            pjdsGetOptions = options;
        });
        sinon.stub(pjds, 'delete', function(req, res, options, callback) {
            callback(null, pjdsGetResult);
            pjdsDeleteOptions = options;
        });
    });


    describe('ADD', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
        });

        it('Creates an orderset Favorite', function() {
            req = createReqWithParam({
                id: 'foo',
                type: 'orderset'
            });
            favorites.addFavorites(req, res);
            expect(pjds.post.called).to.be.true();
        });
        it('Creates an quickorder Favorite', function() {
            req = createReqWithParam({
                id: 'foo',
                type: 'quickorder'
            });
            favorites.addFavorites(req, res);
            expect(pjds.post.called).to.be.true();
        });
        it('Creates an orderable Favorite', function() {
            req = createReqWithParam({
                id: 'foo',
                type: 'orderable',
                domain: 'domain',
                siteId: 'SITE'
            });
            favorites.addFavorites(req, res);
            expect(pjds.post.called).to.be.true();
        });
        it('Sets Favorite userId from user session', function() {
            favorites.addFavorites(req, res);
            expect(storedFavorite.userId).to.equal('userUid');
        });
        it('Returns HTTP-400 bad request if Favorite type is missing', function() {
            req = createReqWithParam({
                id: 'foo'
            });
            favorites.addFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if Favorite id is missing', function() {
            req = createReqWithParam({
                type: 'orderset'
            });
            favorites.addFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required domain parameter is missing for orderable', function() {
            req = createReqWithParam({
                id: 'foo',
                type: 'orderable'
            });
            favorites.addFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required siteId parameter is missing for orderable', function() {
            req = createReqWithParam({
                id: 'foo',
                type: 'orderable',
                domain: 'lab'
            });
            favorites.addFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
    });


    describe('GET', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
        });
        it('GET Favorites', function() {
            favorites.getFavorites(req, res);
            expect(pjds.get.called).to.be.true();
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });
    });


    describe('DELETE', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                id: 'someUid',
                type: 'orderset'
            });
            favorites.deleteFavorites(req, res);
            expect(pjds.delete.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required id parameter is missing', function() {
            req = createReqWithParam({
                type: 'orderset'
            });
            favorites.deleteFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required type parameter is missing', function() {
            req = createReqWithParam({
                id: 'someUid'
            });
            favorites.deleteFavorites(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });

});
