define([
    'require',
    'test/stubs',
    'jasminejquery',
    'backbone',
    'underscore'
], function(require, Stubs, jasminejquery, Backbone, _) {
    'use strict';

    describe('Setting up stacked graph tests', function() {
        var StackedGraphModel;

        beforeEach(function(done) {
            if (_.isUndefined(StackedGraphModel)) {
                require(['app/resources/writeback/stackedGraph/model'], function(model) {
                    StackedGraphModel = model;
                    return done();
                });
            } else {
                return done();
            }
        });


        describe('Stacked graph resource pool model tests', function() {
            _.set(ADK, 'ADKApp.currentScreen.config.id', 'test-workspace');

            it('Should set defaults correctly', function() {
                var model = new StackedGraphModel();
                expect(model.get('id')).toEqual('test-workspace');
                expect(model.isNew()).toBe(true);
                expect(model.resource).toEqual('user-defined-stack');
            });

            it('Should set isNew value', function() {
                var model = new StackedGraphModel();
                model.setIsNew(false);
                expect(model.isNew()).toBe(false);
            });
        });
    });
});