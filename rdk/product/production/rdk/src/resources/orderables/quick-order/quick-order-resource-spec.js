'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var quickorder = require('../../../subsystems/orderables/quickorder-subsystem');

var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

function isTriplet(item) {
    return !_.isEmpty(item) && item.length === 3;
}

function isEqFilter(item) {
    return isTriplet(item) && item[0] === 'eq';
}

function isEnterpriseQuery(item) {
    return isEqFilter(item) && item[1] === 'scope' && item[2] === 'enterprise';
}

function isSiteQuery(item) {
    if (!isTriplet(item)) {
        return false;
    }
    if (item[0] !== 'and') {
        return false;
    }
    var hasScopeEq = false;
    var hasSiteEq = false;

    _.forEach(_.takeRight(item, 2), function(operand) {
        if (isEqFilter(operand)) {
            if (operand[1] === 'scope') {
                hasScopeEq = true;
            } else if (operand[1] === 'siteId') {
                hasSiteEq = true;
            }
        }
    });
    return hasScopeEq && hasSiteEq;
}

function isIndividualQuery(item) {
    if (!isTriplet(item)) {
        return false;
    }
    if (item[0] !== 'and') {
        return false;
    }

    var hasScopeEq = false;
    var hasCreatedBy = false;

    _.forEach(_.takeRight(item, 2), function(operand) {
        if (isEqFilter(operand)) {
            if (operand[1] === 'scope') {
                hasScopeEq = true;
            } else if (operand[1] === 'createdBy') {
                hasCreatedBy = true;
            }
        }
    });
    return hasScopeEq && hasCreatedBy;
}

function isScopeQuery(item) {
    if (_.isEmpty(item)) {
        return false;
    }
    if (item.length !== 4) {
        return false;
    }
    if (item[0] !== 'or') {
        return false;
    }
    var hasEnterpriseQuery = false;
    var hasSiteQuery = false;
    var hasIndividualQuery = false;

    _.forEach(_.takeRight(item, 3), function(operand) {
        if (isEnterpriseQuery(operand)) {
            hasEnterpriseQuery = true;
        } else if (isSiteQuery(operand)) {
            hasSiteQuery = true;
        } else if (isIndividualQuery(operand)) {
            hasIndividualQuery = true;
        }
    });
    return hasEnterpriseQuery && hasSiteQuery && hasIndividualQuery;
}

function isNameQuery(item) {
    var wildcardRegex = /^%\w+%$/;

    if (!isTriplet(item)) {
        return false;
    }
    return item[0] === 'ilike' && item[1] === 'name' && wildcardRegex.test(item[2]);
}

function isNameAndScopeQuery(item) {
    if (_.isEmpty(item)) {
        return false;
    }
    if (item.length !== 3) {
        return false;
    }
    if (item[0] !== 'and') {
        return false;
    }
    var hasScopeQuery = false;
    var hasNameQuery = false;

    _.forEach(_.takeRight(item, 2), function(operand) {
        if (isScopeQuery(operand)) {
            hasScopeQuery = true;
        } else if (isNameQuery(operand)) {
            hasNameQuery = true;
        }
    });
    return hasScopeQuery && hasNameQuery;
}

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
            config: {},
            subsystems: {
                quickorder: quickorder
            }
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
describe.skip('QuickOrders', function() {
    var req;
    var res = {
        status: function() {
            return {
                rdkSend: noop
            };
        }
    };
    var quickorderPayload;
    var pjdsPutOptions;
    var pjdsGetOptions;
    var pjdsDeleteOptions;
    var storedData;
    var pjdsGetResult;


    beforeEach(function() {
        pjdsPutOptions = null;

        req = createReqWithParam();

        quickorderPayload = {
            'name': 'Hypertensive Patient - Enterprise',
            'scope': 'enterprise',
            'orderable': 'uid:va:orderable:111111',
            'formData': {
                'button1': 'Hello',
                'listBox': ['med 1', 'med 2']
            },
            'active': true
        };
        sinon.spy(res, 'status');

        sinon.stub(pjds, 'post', function(req, res, options, callback) {
            storedData = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'put', function(req, res, options, callback) {
            storedData = options.data;
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

    describe('CREATE', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
        });

        it('Creates a QuickOrder', function() {
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(pjdsPutOptions.data).to.equal(quickorderPayload);
            expect(pjds.post.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if QuickOrder payload is missing', function() {
            req.body = undefined;
            quickorder.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the QuickOrder payload\'s formData is missing', function() {
            quickorderPayload.formData = undefined;
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the QuickOrder payload\'s orderable is missing', function() {
            quickorderPayload.orderable = undefined;
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the QuickOrder payload\'s name is missing', function() {
            quickorderPayload.name = undefined;
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
        it('Sets QuickOrder\'s siteId from user session', function() {
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(storedData.siteId).to.equal('vistaSite');
        });
        it('Sets QuickOrder\'s createdBy from user session', function() {
            req.body = quickorderPayload;
            quickorder.create(req, res);
            expect(storedData.createdBy).to.equal('userUid');
        });
    });

    describe('UPDATE', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
            quickorderPayload.uid = 'someUid';
            req = createReqWithParam({
                uid: 'someUid'
            });
        });

        it('Updates a QuickOrder', function() {
            quickorderPayload.uid = 'someUid';
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(pjdsPutOptions.data).to.equal(quickorderPayload);
            expect(pjds.put.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            req = createReqWithParam();
            quickorderPayload.uid = 'someUid';
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if QuickOrder payload is missing', function() {
            req.body = undefined;
            quickorder.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the QuickOrder payload\'s name is missing', function() {
            quickorderPayload.name = undefined;
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the QuickOrder payload\'s uid does not match the uid in the url parameter', function() {
            req = createReqWithParam({
                uid: 'aDifferentUid'
            });
            quickorderPayload.name = undefined;
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
        it('Sets QuickOrder\'s siteId from user session', function() {
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(storedData.siteId).to.equal('vistaSite');
        });
        it('Sets QuickOrder\'s createdBy from user session', function() {
            req.body = quickorderPayload;
            quickorder.update(req, res);
            expect(storedData.createdBy).to.equal('userUid');
        });
    });
    describe('SEARCH', function() {
        it('calls pjds-store with the correct filter list when called without name criteria', function() {
            quickorder.search(req, res);
            expect(pjdsGetOptions.filterList.length).to.equal(4); // ['or', enterpriseQuery, siteQuery, individualQuery]
            expect(isScopeQuery(pjdsGetOptions.filterList)).to.be.true();
            expect(pjds.get.called).to.be.true();
        });
        it('calls pjds-store with the correct filter list when called without name criteria', function() {
            req = createReqWithParam({
                name: 'foo'
            });
            quickorder.search(req, res);
            expect(isNameAndScopeQuery(pjdsGetOptions.filterList)).to.be.true(); // ['and', partialNameQuery, scopeQuery]
            expect(pjds.get.called).to.be.true();
        });
    });
    describe('GET QUICKORDER BY UID', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            quickorder.get(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.get.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            quickorder.get(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
    describe('DELETE', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            quickorder.delete(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.delete.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            quickorder.delete(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
});
