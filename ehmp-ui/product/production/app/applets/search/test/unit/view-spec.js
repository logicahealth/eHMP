/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, ADK*/

'use strict';

define([
    "jquery",
    "backbone",
    "marionette",
    "jasminejquery",
    "test/stubs",
    "app/applets/search/textSearchInput/view"
], function($, Backbone, Marionette, jasmine, Stubs, TextSearchInputView) {
    describe('The search input', function() {
        var view;
        var mockModel;

        Stubs.bootstrapViewTest();

        beforeEach(function() {
            Stubs.getCurrentPatient().set('solrSyncCompleted', false);
            mockModel = new Backbone.Model();
            view = new TextSearchInputView({
                model: mockModel
            });
            Stubs.testRegion.show(view);
        });

        describe('when constructing the view', function() {
            it('should exist', function() {
                expect(view).toBeDefined();
            });

            it('should set search term', function() {
                expect(view.searchTerm.get('key')).toEqual('value');
            });
        });

        describe('enableDisablePatientSearch', function() {
            it('should enable', function() {
                view.enableDisablePatientSearch(true, 0);
                expect(view.$('#searchText')).not.toBeDisabled();
                expect(view.$('#searchText')).toHaveAttr('placeholder', 'Search Record');
            });

            it('should disable', function() {
                view.enableDisablePatientSearch(false, 0);
                expect(view.$('#searchText')).toBeDisabled();
                expect(view.$('#searchText')).toHaveAttr('placeholder', 'Building Search Data');
            });
        });
    });
});