'use strict';

var _ = require('lodash');
var rdk = require('../../../core/rdk');
var pjds = rdk.utils.pjdsStore;
var orderset = require('./order-set');

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

function isPartialNameQuery(item) {
    return isTriplet(item) && item[0] === 'ilike' && item[1] === 'name';
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
            config: {}
        },
        session: {
            user: {
                site: '9E7A',
                uid: 'urn:va:user:9E7A:10000000000'
            }
        }
    };
    return req;
}

describe('OrderSets', function() {
    var req;
    var result;
    var res = {
        status: function() {
            return {
                rdkSend: noop
            };
        }
    };
    var ordersetPayload;
    var pjdsPutOptions;
    var pjdsGetOptions;
    var pjdsDeleteOptions;
    var pjdsOpStub = function(req, res, options, callback) {
        pjdsPutOptions = options;
    };
    var storedOrderSet;
    var pjdsGetResult;


    beforeEach(function() {
        pjdsPutOptions = null;

        req = createReqWithParam();

        ordersetPayload = {
            'name': 'Hypertensive Patient',
            'scope': 'site',
            'orderList': [{
                'uid': 'urn:va:quickorder:3',
                'type': 'quickorder',
                'siteId': '9E7A',
                'createdBy': 'urn:va:user:9E7A:10000000000',
                'name': 'COMPREHENSIVE METABOLIC PANEL',
                'scope': 'site',
                'active': true
            }, {
                'uid': 'urn:va:lab:9E7A:512',
                'type': 'orderable',
                'domain': 'lab',
                'siteId': '9E7A',
                'name': 'FASTING GLUCOSE',
                'scope': 'site',
                'active': true
            }],
            'active': true
        };
        sinon.spy(res, 'status');

        sinon.stub(pjds, 'post', function(req, res, options, callback) {
            storedOrderSet = options.data;
            pjdsPutOptions = options;
        });
        sinon.stub(pjds, 'put', function(req, res, options, callback) {
            storedOrderSet = options.data;
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

        it('Creates an OrderSet', function() {
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(pjdsPutOptions.data).to.equal(ordersetPayload);
            expect(pjds.post.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if OrderSet payload is missing', function() {
            req.body = undefined;
            orderset.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the OrderSet payload\'s orderList is missing', function() {
            ordersetPayload.orderList = undefined;
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the OrderSet payload\'s name is missing', function() {
            ordersetPayload.name = undefined;
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
        it('Sets OrderSet\'s siteId from user session', function() {
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(storedOrderSet.siteId).to.equal('9E7A');
        });
        it('Sets OrderSet\'s createdBy from user session', function() {
            req.body = ordersetPayload;
            orderset.create(req, res);
            expect(storedOrderSet.createdBy).to.equal('urn:va:user:9E7A:10000000000');
        });
        describe('Returns HTTP-400 bad request if items in the OrderSet payload\'s orderList are not valid', function() {
            beforeEach(function() {
                req.body = ordersetPayload;
            });

            it('missing uid', function() {
                req.body.orderList = [{
                    //'uid': '507f191e810c19729de860ea',
                    'type': 'quickorder',
                    'name': 'HCTZ 50mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.create(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('missing type', function() {
                req.body.orderList = [{
                    'uid': '507f191e810c19729de860ea',
                    //'type': 'quickorder',
                    'name': 'HCTZ 50mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.create(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('invalid domain for orderable type', function() {
                req.body.orderList = [{
                    'uid': '512',
                    'type': 'orderable',
                    'domain': 'invalid_domain',
                    'siteId': '9E7A',
                    'name': 'Lisinopril 5mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.create(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('missing siteId for orderable type', function() {
                req.body.orderList = [{
                    'uid': '512',
                    'type': 'orderable',
                    'domain': 'invalid_domain',
                    //'siteId': '9E7A',
                    'name': 'Lisinopril 5mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.create(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
        });
        describe('Returns HTTP-400 bad request if the contents of orderList violate the scope rules :: ', function() {
            var payload;

            beforeEach(function() {
                payload = {
                    'name': 'Hypertensive Patient',
                    'scope': 'enterprise',
                    'orderList': [{
                        'uid': 'urn:va:quickorder:3',
                        'type': 'quickorder',
                        'siteId': '9E7A',
                        'createdBy': 'urn:va:user:9E7A:10000000000',
                        'name': 'COMPREHENSIVE METABOLIC PANEL',
                        'scope': 'enterprise',
                        'active': true
                    }, {
                        'uid': 'urn:va:lab:9E7A:512',
                        'type': 'orderable',
                        'domain': 'lab',
                        'siteId': '9E7A',
                        'name': 'FASTING GLUCOSE',
                        'scope': 'enterprise',
                        'active': true
                    }],
                    'active': true
                };
            });

            describe('Enterprise OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'enterprise';
                });

                it('Site quickorder', function() {
                    payload.orderList[0].scope = 'site';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable', function() {
                    payload.orderList[1].scope = 'site';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder', function() {
                    payload.orderList[0].scope = 'individual';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual orderable', function() {
                    payload.orderList[1].scope = 'individual';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
            describe('Site OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'site';
                });
                it('Site quickorder :: different site', function() {
                    payload.orderList[0].scope = 'site';
                    payload.orderList[0].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable :: different site', function() {
                    payload.orderList[1].scope = 'site';
                    payload.orderList[1].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder', function() {
                    payload.orderList[0].scope = 'individual';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual orderable', function() {
                    payload.orderList[1].scope = 'individual';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
            describe('Individual OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'individual';
                });
                it('Site quickorder :: different site', function() {
                    payload.orderList[0].scope = 'site';
                    payload.orderList[0].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable :: different site', function() {
                    payload.orderList[1].scope = 'site';
                    payload.orderList[1].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder :: different user id', function() {
                    payload.orderList[0].scope = 'individual';
                    payload.orderList[0].createdBy = 'someOtherUid';
                    req.body = payload;
                    orderset.create(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
        });
    });
    describe('UPDATE', function() {
        beforeEach(function() {
            pjdsGetResult = {
                data: []
            };
            ordersetPayload.uid = 'someUid';
            req = createReqWithParam({
                uid: 'someUid'
            });
        });

        it('Updates an OrderSet', function() {
            ordersetPayload.uid = 'someUid';
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(pjdsPutOptions.data).to.equal(ordersetPayload);
            expect(pjds.put.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            req = createReqWithParam();
            ordersetPayload.uid = 'someUid';
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if OrderSet payload is missing', function() {
            req.body = undefined;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the OrderSet payload\'s orderList is missing', function() {
            ordersetPayload.orderList = undefined;
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the OrderSet payload\'s name is missing', function() {
            ordersetPayload.name = undefined;
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-400 bad request if the OrderSet payload\'s uid does not match the uid in the url parameter', function() {
            req = createReqWithParam({
                uid: 'aDifferentUid'
            });
            ordersetPayload.name = undefined;
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });
        it('Returns HTTP-409 conflict if there\'s a name collision', function() {
            pjdsGetResult.data = [
                'found one item'
            ]; // mock a name collision
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(res.status.calledWith(rdk.httpstatus.conflict)).to.be.true();
        });
        it('Sets OrderSet\'s siteId from user session', function() {
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(storedOrderSet.siteId).to.equal('9E7A');
        });
        it('Sets OrderSet\'s createdBy from user session', function() {
            req.body = ordersetPayload;
            orderset.updateOrderSet(req, res);
            expect(storedOrderSet.createdBy).to.equal('urn:va:user:9E7A:10000000000');
        });
        describe('Returns HTTP-400 bad request if items in the OrderSet payload\'s orderList are not valid', function() {
            beforeEach(function() {
                req.body = ordersetPayload;
            });

            it('missing uid', function() {
                req.body.orderList = [{
                    //'uid': '507f191e810c19729de860ea',
                    'type': 'quickorder',
                    'name': 'HCTZ 50mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.updateOrderSet(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('missing type', function() {
                req.body.orderList = [{
                    'uid': '507f191e810c19729de860ea',
                    //'type': 'quickorder',
                    'name': 'HCTZ 50mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.updateOrderSet(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('invalid domain for orderable type', function() {
                req.body.orderList = [{
                    'uid': '512',
                    'type': 'orderable',
                    'domain': 'invalid_domain',
                    'siteId': '9E7A',
                    'name': 'Lisinopril 5mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.updateOrderSet(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
            it('missing siteId for orderable type', function() {
                req.body.orderList = [{
                    'uid': '512',
                    'type': 'orderable',
                    'domain': 'invalid_domain',
                    //'siteId': '9E7A',
                    'name': 'Lisinopril 5mg PO QD',
                    'scope': 'individual',
                    'active': true
                }];
                orderset.updateOrderSet(req, res);
                expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
            });
        });
        describe('Returns HTTP-400 bad request if the contents of orderList violate the scope rules :: ', function() {
            var payload;

            beforeEach(function() {
                payload = {
                    'uid': 'someUid',
                    'name': 'Hypertensive Patient',
                    'scope': 'enterprise',
                    'orderList': [{
                        'uid': 'urn:va:quickorder:3',
                        'type': 'quickorder',
                        'siteId': '9E7A',
                        'createdBy': 'urn:va:user:9E7A:10000000000',
                        'name': 'COMPREHENSIVE METABOLIC PANEL',
                        'scope': 'enterprise',
                        'active': true
                    }, {
                        'uid': 'urn:va:lab:9E7A:512',
                        'type': 'orderable',
                        'domain': 'lab',
                        'siteId': '9E7A',
                        'name': 'FASTING GLUCOSE',
                        'scope': 'enterprise',
                        'active': true
                    }],
                    'active': true
                };
            });

            describe('Enterprise OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'enterprise';
                });

                it('Site quickorder', function() {
                    payload.orderList[0].scope = 'site';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable', function() {
                    payload.orderList[1].scope = 'site';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder', function() {
                    payload.orderList[0].scope = 'individual';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual orderable', function() {
                    payload.orderList[1].scope = 'individual';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
            describe('Site OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'site';
                });
                it('Site quickorder :: different site', function() {
                    payload.orderList[0].scope = 'site';
                    payload.orderList[0].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable :: different site', function() {
                    payload.orderList[1].scope = 'site';
                    payload.orderList[1].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder', function() {
                    payload.orderList[0].scope = 'individual';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual orderable', function() {
                    payload.orderList[1].scope = 'individual';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
            describe('Individual OrderSet :: ', function() {
                beforeEach(function() {
                    payload.scope = 'individual';
                });
                it('Site quickorder :: different site', function() {
                    payload.orderList[0].scope = 'site';
                    payload.orderList[0].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Site orderable :: different site', function() {
                    payload.orderList[1].scope = 'site';
                    payload.orderList[1].siteId = 'someOthersite';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
                it('Individual quickorder :: different user id', function() {
                    payload.orderList[0].scope = 'individual';
                    payload.orderList[0].createdBy = 'someOtherUid';
                    req.body = payload;
                    orderset.updateOrderSet(req, res);
                    expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
                });
            });
        });
    });
    describe('SEARCH', function() {
        it('calls pjds-store with the correct filter list when called without name criteria', function() {
            orderset.getSearch(req, res);
            expect(pjdsGetOptions.filterList.length).to.equal(4); // ['or', enterpriseQuery, siteQuery, individualQuery]
            expect(isScopeQuery(pjdsGetOptions.filterList)).to.be.true();
            expect(pjds.get.called).to.be.true();
        });
        it('calls pjds-store with the correct filter list when called without name criteria', function() {
            req = createReqWithParam({
                name: 'foo'
            });
            orderset.getSearch(req, res);
            expect(isNameAndScopeQuery(pjdsGetOptions.filterList)).to.be.true(); // ['and', partialNameQuery, scopeQuery]
            expect(pjds.get.called).to.be.true();
        });
    });
    describe('GET ORDERSET BY UID', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            orderset.getOrderSetByUid(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.get.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            orderset.getOrderSetByUid(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
    describe('DELETE', function() {
        it('calls pjds-store with the correct options', function() {
            req = createReqWithParam({
                uid: 'someUid'
            });
            orderset.delete(req, res);
            expect(pjdsGetOptions.key).to.equal('someUid');
            expect(pjds.delete.called).to.be.true();
        });
        it('Returns HTTP-400 bad request if the required uid parameter is missing', function() {
            orderset.delete(req, res);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();
        });

    });
});
