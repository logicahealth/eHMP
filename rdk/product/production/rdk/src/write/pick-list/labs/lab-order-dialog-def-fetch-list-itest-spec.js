'use strict';

var fetchList = require('./lab-order-dialog-def-fetch-list').fetch;
var _ = require('lodash');

describe('lab-order-dialog-def resource integration test', function() {
    var log = sinon.stub(require('bunyan').createLogger({
        name: 'lab-order-dialog-def-fetch-list'
    }));
    //var log = require('bunyan').createLogger({ name: 'lab-order-dialog-def-fetch-list' }); //Uncomment this line (and comment above) to see output in IntelliJ console

    var configuration = _.get(getAppConfig(), ['vistaSites', 'C877'], {});
    configuration.context = 'OR CPRS GUI CHART';

    it('can call the lab-order-dialog-def', function(done) {
        this.timeout(20000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.truthy();
            done();
        }, {
            location: 'urn:va:location:C877:507',
            division: '507'
        });
    });
    it('will return an error if locationIEN is missing', function(done) {
        this.timeout(8000);
        fetchList(log, configuration, function(err, result) {
            expect(err).to.be.truthy();
            expect(result).to.be.falsy();
            done();
        }, {
            division: '507'
        });
    });
    it('gets a different collection type length from KDK immediate collect divisions', function(done) {
        this.timeout(120000);
        fetchList(log, configuration, function(beeDivErr, beeDivResult) {
            expect(beeDivErr).to.be.falsy();
            expect(beeDivResult).to.be.truthy();

            fetchList(log, configuration, function(washDivFetchErr, washDivResult) {
                expect(washDivFetchErr).to.be.falsy();
                expect(washDivResult).to.be.truthy();
                var washDivResultLen = _.get(washDivResult, '[' + _.findIndex(washDivResult, {
                    'categoryName': 'Collection Types'
                }) + '].values.length', 0);
                var beeDivResultLen = _.get(beeDivResult, '[' + _.findIndex(beeDivResult, {
                    'categoryName': 'Collection Types'
                }) + '].values.length', 0);
                expect(washDivResultLen).not.to.eql(beeDivResultLen);

                done();
            }, {
                location: 'urn:va:location:C877:688',
                division: '688'
            }); //WASHINGTON
        }, {
            location: 'urn:va:location:C877:507',
            division: '507'
        }); //CAMP BEE
    });
});
