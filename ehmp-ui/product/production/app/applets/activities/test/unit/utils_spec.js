/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, handlebars, ADK, jasmine, document, window, backgrid */

'use strict';

// Jasmine Unit Testing Suite
define(['test/stubs',
    'jquery',
    'backbone',
    'marionette',
    'moment',
    'jasminejquery',
    'app/applets/activities/applet',
    'app/applets/activities/utils',
    'require',
    'underscore'
], function(Stubs, $, Backbone, Marionette, moment, JasmineJquery, ActivitiesApplet, Util, require, _) {
    describe('Load ActivitiesModel', function() {
        var ActivitiesModel;

        beforeEach(function(done) {
            if (_.isUndefined(ActivitiesModel)) {
                require(['app/resources/fetch/activities/model'], function(model) {
                    ActivitiesModel = model;
                    done();
                });
            } else {
                return done();
            }
        });

        describe('Test Activities applet', function() {
            var regionManager = new Backbone.Marionette.RegionManager();
            var testRegion;
            var getMockActivitiesModel = function(urgencyCode) {
                return new ActivitiesModel({
                    ASSIGNEDTOFACILITYID: '500',
                    CREATEDATID: '500',
                    CREATEDON: '2016-11-23T16:18:56.000Z',
                    CREATEDONFORMATTED: '201611231118',
                    ISACTIVITYHEALTHY: 1,
                    TASKSTATE: 'Unreleased:Pending Signature',
                    URGENCY: urgencyCode,
                    assignedFacilityName: 'Camp Master',
                    createdAtName: 'Camp Master',
                    isActivityHealthy: 1,
                    taskState: 'Unreleased',
                    urgency: 'Routine'
                }, {
                    parse: true
                });
            };

            beforeEach(function() {
                $('body').append('<div class="testRegion"/>');
                testRegion = regionManager.addRegion('testRegion', Backbone.Marionette.Region.extend({
                    el: '.testRegion'
                }));

                //this will affect every test in this 'desribe' until explicitly set to something else
                spyOn(ADK.ResourceService, 'fetchCollection').and.callFake(function(options, coll) {
                    coll.set([{
                        division: 1,
                        siteCode: 10,
                        message: 'test1'
                    }, {
                        division: 2,
                        siteCode: 20,
                        message: 'test2'
                    }]);
                    coll.trigger('read:success', coll, {}, options);
                });
                spyOn(ADK.Messaging, 'request').and.callFake(function(channel) {
                    if (channel === 'facilityMonikers') {
                        return new Backbone.Collection({
                            facilityCode: '500',
                            facilityMoniker: 'TST1',
                            facilityName: 'Camp Master'
                        });
                    } else if (channel === 'get:current:workspace') {
                        return 'activities_test_page';
                    }
                });
                spyOn(ADK.SessionStorage, 'getAppletStorageModel').and.callFake(function() {
                    return undefined;
                });
                spyOn(ADK.WorkspaceContextRepository, 'currentContextId').and.callFake(function() {
                    return 'patient';
                });
                spyOn(ADK.SessionStorage.get, 'sessionModel').and.callFake(function(channel) {
                    if (channel === 'expandedAppletId') {
                        return new Backbone.Model({
                            id: 'activities_test'
                        });
                    }
                });
            });

            afterEach(function() { //avoid leaking into other tests
                if (regionManager.get('testRegion')) {
                    regionManager.removeRegion('testRegion');
                }
                $('body > .testRegion').remove();
            });
            describe('Test Activities applet utils Base FilterModel', function() {
                var testModel = new Util.FilterModel({}, {
                    appletConfig: {
                        fullScreen: false,
                        instanceId: 'activities_test_1'
                    },
                    columnsViewType: 'expanded'
                });
                it('intendedForMeAndMyTeams is true', function() {
                    expect(testModel.get('intendedForMeAndMyTeams')).toBe(true);
                });
                it('createdByMe is true', function() {
                    expect(testModel.get('createdByMe')).toBe(true);
                });
                it('primarySelection is intendedForAndCreatedByMe', function() {
                    expect(testModel.get('primarySelection')).toBe('intendedForAndCreatedByMe');
                });
                it('mode is open', function() {
                    expect(testModel.get('mode')).toBe('open');
                });
            });
            describe('Test Activities applet utils FilterModel after model changes', function() {
                var testModel = new Util.FilterModel({}, {
                    appletConfig: {
                        fullScreen: false,
                        instanceId: 'activities_test_2'
                    },
                    columnsViewType: 'expanded'
                });
                testModel.set({
                    primarySelection: 'none',
                    mode: 'closed',
                    onlyShowFlaggedConsults: false
                });
                it('intendedForMeAndMyTeams is false', function() {
                    expect(testModel.get('intendedForMeAndMyTeams')).toBe(false);
                });
                it('createdByMe is false', function() {
                    expect(testModel.get('createdByMe')).toBe(false);
                });
                it('primarySelection is none', function() {
                    expect(testModel.get('primarySelection')).toBe('none');
                });
                it('mode is closed', function() {
                    expect(testModel.get('mode')).toBe('closed');
                });
            });
            describe('Test Activities applet utils parseResponse', function() {
                it('Base parse fields parse correctly', function() {
                    var localDateTime = moment.utc('11/23/2016 16:18:56', 'MM/DD/YYYY HH:mm:ss').local();
                    var mockActivitiesModel = getMockActivitiesModel(9);
                    expect(mockActivitiesModel.get('assignedFacilityName')).toBe('Camp Master');
                    expect(mockActivitiesModel.get('createdAtName')).toBe('Camp Master');
                    expect(mockActivitiesModel.get('createdOn')).toBe(localDateTime.format('YYYYMMDDHHmmss'));
                    expect(mockActivitiesModel.get('isActivityHealthy')).toBe(1);
                    expect(mockActivitiesModel.get('taskState')).toBe('Unreleased');
                    expect(mockActivitiesModel.get('urgency')).toBe('Routine');
                });
                it('Urgancy of 2 parses to Emergent', function() {
                    var mockActivitiesModel = getMockActivitiesModel(2);
                    expect(mockActivitiesModel.get('urgency')).toBe('Emergent');
                });
                it('Urgancy of 3 parses to Pre-op', function() {
                    var mockActivitiesModel = getMockActivitiesModel(3);
                    expect(mockActivitiesModel.get('urgency')).toBe('Pre-op');
                });
                it('Urgancy of 4 parses to Urgent', function() {
                    var mockActivitiesModel = getMockActivitiesModel(4);
                    expect(mockActivitiesModel.get('urgency')).toBe('Urgent');
                });
                it('Urgancy of 5 parses to Admit', function() {
                    var mockActivitiesModel = getMockActivitiesModel(5);
                    expect(mockActivitiesModel.get('urgency')).toBe('Admit');
                });
                it('Urgancy of 6 parses to Outpatient', function() {
                    var mockActivitiesModel = getMockActivitiesModel(6);
                    expect(mockActivitiesModel.get('urgency')).toBe('Outpatient');
                });
                it('Urgancy of 7 parses to Purple Triangle', function() {
                    var mockActivitiesModel = getMockActivitiesModel(7);
                    expect(mockActivitiesModel.get('urgency')).toBe('Purple Triangle');
                });
            });
        });
    });
});