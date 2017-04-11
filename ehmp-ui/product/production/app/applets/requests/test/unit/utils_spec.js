/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, handlebars, ADK, jasmine, document, window, backgrid */

'use strict';

// Jasmine Unit Testing Suite
define(["test/stubs",
        "jquery",
        "backbone",
        "marionette",
        "jasminejquery",
        "app/applets/requests/applet",
        "app/applets/requests/utils"
    ],
    function(Stubs, $, Backbone, Marionette, JasmineJquery, RequestsApplet, Util) {
        describe("Test Request applet", function() {
            var config = RequestsApplet;
            var View = config.viewTypes[1].view;
            var regionManager = new Backbone.Marionette.RegionManager();
            var testRegion;
            var getMockResponse = function(urgancyCode) {
                return Util.parseResponse({
                    ASSIGNEDTOFACILITYID: "500",
                    CREATEDATID: "500",
                    CREATEDON: "2016-11-23T16:18:56.000Z",
                    CREATEDONFORMATTED: "201611231118",
                    ISACTIVITYHEALTHY: 1,
                    TASKSTATE: "Unreleased:Pending Signature",
                    URGENCY: urgancyCode
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
                            facilityCode: "500",
                            facilityMoniker: "TST1",
                            facilityName: "Camp Master"
                        });
                    } else if (channel === 'get:current:workspace') {
                        return 'request_test_page';
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
                            id: "request_test"
                        });
                    }
                });
            });

            afterEach(function() { //avoid leaking into other tests
                if (regionManager.get('testRegion')) regionManager.removeRegion('testRegion');
                $('body > .testRegion').remove();
            });
            describe("Test Request applet utils Base FilterModel", function() {
                var testModel = new Util.FilterModel({}, {
                    appletConfig: {
                        fullScreen: false,
                        instanceId: 'requests_test_1'
                    },
                    columnsViewType: 'expanded'
                });
                it("intendedForMeAndMyTeams is true", function() {
                    expect(testModel.get('intendedForMeAndMyTeams')).toBe(true);
                });
                it("onlyShowFlaggedRequests is true", function() {
                    expect(testModel.get('onlyShowFlaggedRequests')).toBe(true);
                });
                it("createdByMe is true", function() {
                    expect(testModel.get('createdByMe')).toBe(true);
                });
                it("primarySelection is intendedForAndCreatedByMe", function() {
                    expect(testModel.get('primarySelection')).toBe('intendedForAndCreatedByMe');
                });
                it("mode is open", function() {
                    expect(testModel.get('mode')).toBe('open');
                });
            });
            describe("Test Request applet utils FilterModel after model changes", function() {
                var testModel = new Util.FilterModel({}, {
                    appletConfig: {
                        fullScreen: false,
                        instanceId: 'requests_test_2'
                    },
                    columnsViewType: 'expanded'
                });
                testModel.set({
                    primarySelection: 'none',
                    mode: 'closed',
                    onlyShowFlaggedRequests: false
                });
                it("intendedForMeAndMyTeams is false", function() {
                    expect(testModel.get('intendedForMeAndMyTeams')).toBe(false);
                });
                it("onlyShowFlaggedRequests is false", function() {
                    expect(testModel.get('onlyShowFlaggedRequests')).toBe(false);
                });
                it("createdByMe is false", function() {
                    expect(testModel.get('createdByMe')).toBe(false);
                });
                it("primarySelection is none", function() {
                    expect(testModel.get('primarySelection')).toBe('none');
                });
                it("mode is closed", function() {
                    expect(testModel.get('mode')).toBe('closed');
                });
            });
            describe("Test Request applet utils parseResponse", function() {
                it("Base parse fields parse correctly", function() {
                    var mockResponse = getMockResponse(9);
                    expect(mockResponse.assignedFacilityName).toBe("Camp Master");
                    expect(mockResponse.createdAtName).toBe("Camp Master");
                    expect(mockResponse.createdOn).toBe("20161123");
                    expect(mockResponse.isActivityHealthy).toBe(1);
                    expect(mockResponse.taskState).toBe("Unreleased");
                    expect(mockResponse.urgency).toBe("Routine");
                });
                it("Urgancy of 2 parses to Emergent", function() {
                    var mockResponse = getMockResponse(2);
                    expect(mockResponse.urgency).toBe("Emergent");
                });
                it("Urgancy of 3 parses to Pre-op", function() {
                    var mockResponse = getMockResponse(3);
                    expect(mockResponse.urgency).toBe("Pre-op");
                });
                it("Urgancy of 4 parses to Urgent", function() {
                    var mockResponse = getMockResponse(4);
                    expect(mockResponse.urgency).toBe("Urgent");
                });
                it("Urgancy of 5 parses to Admit", function() {
                    var mockResponse = getMockResponse(5);
                    expect(mockResponse.urgency).toBe("Admit");
                });
                it("Urgancy of 6 parses to Outpatient", function() {
                    var mockResponse = getMockResponse(6);
                    expect(mockResponse.urgency).toBe("Outpatient");
                });
                it("Urgancy of 7 parses to Purple Triangle", function() {
                    var mockResponse = getMockResponse(7);
                    expect(mockResponse.urgency).toBe("Purple Triangle");
                });
            });
        });

    });