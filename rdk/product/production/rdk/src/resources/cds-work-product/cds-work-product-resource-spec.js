'use strict';

var rdk = require('../../core/rdk');
var cdsWorkProductResource = require('./cds-work-product-resource');
var workProduct = require('./cds-work-product');
var cdsSpecUtil = require('../cds-spec-util/cds-spec-util');
var mongo = require('mongoskin');

var mockReqResUtil = cdsSpecUtil.mockReqResUtil;
var appReference = cdsSpecUtil.createAppReference;

describe('CDS Work Product Resource', function() {

    var resources = cdsWorkProductResource.getResourceConfig(appReference());
    var interceptors = {
       operationalDataCheck: false,
       synchronize: false
    };

    it('has 8 endpoints configured', function() {
        expect(resources.length).to.equal(8);
    });

    it('tests that getResourceConfig() is setup correctly for createWorkProduct', function() {
        var res = resources[0];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-create');
        expect(res.path).to.equal('/product');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.post).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for retrieveWorkProduct', function() {
        var res = resources[1];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-retrieve');
        expect(res.path).to.equal('/product');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.get).not.to.be.undefined();
    });


    it('tests that getResourceConfig() is setup correctly for user updateWorkProduct', function() {
        var res = resources[2];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-update');
        expect(res.path).to.equal('/product');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.put).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for deleteWorkProduct', function() {
        var res = resources[3];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-delete');
        expect(res.path).to.equal('/product');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.delete).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for subscriptions', function() {
        var res = resources[4];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-subscription-retrieve');
        expect(res.path).to.equal('/subscriptions');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for subscriptions', function() {
        var res = resources[5];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-subscription-update');
        expect(res.path).to.equal('/subscriptions');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.put).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for subscriptions', function() {
        var res = resources[6];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-cds-work-product-subscription-delete');
        expect(res.path).to.equal('/subscriptions');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.delete).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for retrieveInbox', function() {
        var res = resources[7];
        expect(res).not.to.be.undefined();
        expect(res.name).to.equal('cds-work-product-inbox');
        expect(res.path).to.equal('/inbox');
        expect(res.interceptors).to.eql(interceptors);

        expect(res.get).not.to.be.undefined();
    });

    describe('List endpoint HTTP response codes', function() {

        //        var resources = cdsWorkProductResource.getResourceConfig(appReference());
        var res = mockReqResUtil.response;

        beforeEach(function() {
            sinon.spy(res, 'status');
            //sinon.spy(res, 'rdkSend');
        });

        var db;

        it('retrieveWorkProduct responds HTTP Bad Request when id parameter is not valid', function() {

            //Create the mocked MongoDB functions that are used by the code that we're testing...
            db = cdsSpecUtil.createMockDb({
                find: function() {
                    return {
                        toArray: function(callback) {
                            callback(null, []);
                        }
                    };
                },
                ensureIndex: function() {
                    return;
                }
            });

            sinon.stub(mongo, 'db').returns(db);
            workProduct.init(appReference());

            workProduct.retrieveWorkProduct(mockReqResUtil.createRequestWithParam({ id: 'Id_TOO_LONG_12345678597897897897879878978979879'}, null), res);
            //console.log(res.status);
            expect(res.status.calledWith(rdk.httpstatus.bad_request)).to.be.true();

        });


    });


});
