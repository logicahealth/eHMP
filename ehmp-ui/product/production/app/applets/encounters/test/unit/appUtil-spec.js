define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/encounters/appUtil'
], function ($, Backbone, Marionette, Jasmine, Stubs, AppUtil) {
    'use strict';

    describe('The AppUtil', function() {
        Stubs.bootstrapViewTest();

        it('should contain a FILTER_FIELD constant', function() {
            expect(AppUtil.FILTER_FIELD).toEqual('custom_filter_field');
        });

        it('when calling stripCharacters should strip special characters', function() {
            expect(AppUtil.stripCharacters('apple\\\/()!?*&:;,.^\'"<>%')).toEqual('apple');
        });

        describe('when calling getCPTprocedureDetailViewModel', function() {
            it('should return a model JSON representation of Visit', function() {
                var mockView = new Marionette.View({
                    model: new Backbone.Model(),
                    collection: new Backbone.Collection()
                });

                mockView.model.set('collection', new Backbone.Collection({
                    uid: 'abcd'
                }));

                mockView.collection.collection = new Backbone.Collection([{
                    kind: 'Document',
                    uid: '1234',
                    test: '5678'
                }, {
                    kind: 'Visit',
                    uid: 'abcd',
                    test: 'efgh'
                }, {
                    kind: 'Vital',
                    uid: '1111',
                    test: '2222'
                }]);

                var resultingModel = AppUtil.getCPTprocedureDetailViewModel(mockView);

                expect(resultingModel.kind).toEqual('Visit');
                expect(resultingModel.uid).toEqual('abcd');
                expect(resultingModel.test).toEqual('efgh');
            });

            it('should return an error object if the Visit model cannot be found', function() {
                var mockView = new Marionette.View({
                    model: new Backbone.Model(),
                    collection: new Backbone.Collection()
                });

                mockView.model.set('collection', new Backbone.Collection({
                    uid: 'gggg'
                }));

                mockView.collection.collection = new Backbone.Collection([{
                    kind: 'Document',
                    uid: '1234',
                    test: '5678'
                }, {
                    kind: 'Visit',
                    uid: 'abcd',
                    test: 'efgh'
                }, {
                    kind: 'Vital',
                    uid: '1111',
                    test: '2222'
                }]);

                var resultingModel = AppUtil.getCPTprocedureDetailViewModel(mockView);

                expect(resultingModel.fError).toEqual(true);
                expect(resultingModel.summary).toEqual('Error');
                expect(resultingModel.errorMsg).toEqual('Sorry, there is no detailed information about this event!');
            });

            it('should return undefined if the sub-collection does not exist', function() {
                var mockView = new Marionette.View({
                    model: new Backbone.Model(),
                    collection: new Backbone.Collection()
                });

                mockView.model.set('collection', new Backbone.Collection({
                    uid: 'gggg'
                }));

                var resultingModel = AppUtil.getCPTprocedureDetailViewModel(mockView);

                expect(resultingModel).toEqual(undefined);
            });
        });


        describe('when calling showDetailView', function() {
            it('modal is displayed', function() {
                AppUtil.showDetailView(undefined, 'test');
                expect($('#messagingRequest').length).toEqual(1);
            });
        });
    });
});