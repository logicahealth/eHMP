/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, ADK*/

'use strict';

define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/search/textSearchInput/view'
], function($, Backbone, Marionette, jasmine, Stubs, TextSearchInputView) {
    describe('The search input', function() {
        var view;
        var mockModel;

        Stubs.bootstrapViewTest();

        beforeEach(function() {
            Stubs.getCurrentPatient().set('solrSyncCompleted', false);
            mockModel = new Backbone.Model();
            ADK.WorkspaceContextRepository.currentWorkspaceAndContext = new Backbone.Model({
                context: 'patient',
                workspace: 'search'
            });
            spyOn(ADK.SessionStorage, 'getAppletStorageModel').and.callFake(function() {
                return '';
            });
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
                expect(view.searchTerm).toEqual('');
            });
        });

        describe('enableDisablePatientSearch', function() {
            it('should enable', function() {
                view.enableDisablePatientSearch(true, 0);
                expect(view.$('input')).not.toBeDisabled();
                expect(view.$('input')).toHaveAttr('placeholder', 'Search Record');
            });

            it('should disable', function() {
                view.enableDisablePatientSearch(false, 0);
                expect(view.$('input')).toBeDisabled();
                expect(view.$('input')).toHaveAttr('placeholder', 'Building Search Data');
            });
        });

        describe('onSolrOrSyncError', function() {
            it('should disable', function() {
                view.onSolrError();
                var hasOnErrorPlaceholder = _.includes(view.$('input').attr('placeholder'), 'Search is Unavailable');
                expect(view.$('input')).toBeDisabled();
                expect(hasOnErrorPlaceholder).toBe(true);
            });
        });

        describe('solr storage tracking correctly calculates status', function() {
            it('when neither "solrSyncCompleted" or "mySiteSolrSyncCompleted"', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({}))).toBe(false);
            });
            it('when "solrSyncCompleted" is false and "mySiteSolrSyncCompleted" is not set', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: false,
                }))).toBe(false);
            });
            it('when "solrSyncCompleted" is not set and "mySiteSolrSyncCompleted" is false', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    mySiteSolrSyncCompleted: false
                }))).toBe(false);
            });
            it('when "solrSyncCompleted" is true and "mySiteSolrSyncCompleted" is not set', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: true,
                }))).toBe(true);
            });
            it('when "solrSyncCompleted" is not set and "mySiteSolrSyncCompleted" is true', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    mySiteSolrSyncCompleted: true
                }))).toBe(true);
            });
            it('when "solrSyncCompleted" is false and "mySiteSolrSyncCompleted" is false', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: false,
                    mySiteSolrSyncCompleted: false
                }))).toBe(false);
            });
            it('when "solrSyncCompleted" is true and "mySiteSolrSyncCompleted" is false', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: true,
                    mySiteSolrSyncCompleted: false
                }))).toBe(false);
            });
            it('when "solrSyncCompleted" is false and "mySiteSolrSyncCompleted" is true', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: false,
                    mySiteSolrSyncCompleted: true
                }))).toBe(true);
            });
            it('when "solrSyncCompleted" is true and "mySiteSolrSyncCompleted" is true', function() {
                expect(!!view.getMinumumRequiredStatus(new Backbone.Model({
                    solrSyncCompleted: true,
                    mySiteSolrSyncCompleted: true
                }))).toBe(true);
            });
        });
    });
});