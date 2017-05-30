define([
    'test/stubs',
    'jasminejquery',
    'require'
], function(Stubs, jasminejquery, require) {
    'use strict';

    describe('Testing parse functionality for vitals aggregate', function() {
        var AggregateCollection;

        beforeEach(function(done) {
            if (_.isUndefined(AggregateCollection)) {
                require(['app/resources/fetch/vitals/aggregate'], function(colleciton) {
                    AggregateCollection = colleciton;
                    done();
                });
            } else {
                done();
            }
        });


        it('Should test parse for extended aggregate collection without splitting BP vitals', function() {
            var response = {
                data: {
                    items: [{
                        typeName: 'BLOOD PRESSURE',
                        result: '120/80'
                    },
                        {
                            typeName: 'TEMPERATURE',
                            result: '98.6'
                        },
                        {
                            typeName: 'CG',
                            result: '32'
                        }]
                }
            };
            var aggregate = new AggregateCollection();
            aggregate.collection.vitalTypes = ['BP', 'P', 'T', 'CG'];
            var parsedCollection = aggregate.collection.parse(response);
            expect(parsedCollection.length).toEqual(3);
            expect(parsedCollection[0].typeName).toEqual('BLOOD PRESSURE');
            expect(parsedCollection[1].typeName).toEqual('TEMPERATURE');
            expect(parsedCollection[2].typeName).toEqual('CG');
        });

        it('Should test parse for extended aggregate collection with splitting BP vitals', function() {
            var response = {
                data: {
                    items: [{
                        typeName: 'BLOOD PRESSURE',
                        result: '120/80'
                    },
                        {
                            typeName: 'TEMPERATURE',
                            result: '98.6'
                        },
                        {
                            typeName: 'CG',
                            result: '32'
                        }]
                }
            };
            var aggregate = new AggregateCollection();
            aggregate.collection.vitalTypes = ['BPS', 'BPD', 'T'];
            aggregate.collection.splitBP = true;
            var parsedCollection = aggregate.collection.parse(response);
            expect(parsedCollection.length).toEqual(3);
            expect(parsedCollection[0].typeName).toEqual('Blood Pressure Systolic');
            expect(parsedCollection[1].typeName).toEqual('Blood Pressure Diastolic');
            expect(parsedCollection[2].typeName).toEqual('TEMPERATURE');
        });
    });
});