/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn, requirejs, jasmine */

define(['require', 'backbone', 'jquery', 'handlebars', 'moment'], function(require, Backbone, $, Handlebars, moment) {

    'use strict';

    Marionette.Behaviors.behaviorsLookup = function(options, key) {
        var obj = {};
        obj[key] = Marionette.Behavior;
        return obj;
    };

    window.Handlebars = Handlebars;
    window.Backgrid = {};
    _.set(Backgrid, 'StringCell', Marionette.View);
    _.set(Backgrid, 'HandlebarsCell', Marionette.View);
    _.set(Backgrid, 'Body', Marionette.View);

    //patient persists as a singleton model since the moment it's initialized
    var mockPatient = new Backbone.Model();
    var mockCurrentWorkspaceAndContextModel = new Backbone.Model();
    var mockPatientList = new Backbone.Collection();
    //global region manager
    var regionManager = new Backbone.Marionette.RegionManager();

    var Stubs = {
        bootstrapViewTest: function(View) {
            var self = this;
            var createTestRegion = function() {
                if ($('body .testRegion').length) throw "Cannot create more than one test region";
                $('body').append('<div class="testRegion"/>');
                self.testRegion = regionManager.addRegion('testRegion', Backbone.Marionette.Region.extend({
                    el: '.testRegion'
                }));
                if (View) self.testRegion.show(new View());
            };
            var destroyTestRegion = function() {
                var region;
                if (regionManager.get('testRegion')) region = regionManager.removeRegion('testRegion');
                $('body > .testRegion').remove();
                return region;
            };
            beforeEach(createTestRegion);
            afterEach(destroyTestRegion);
        },
        fetchValid: function(opts, collection) {
            if (opts.onSuccess) opts.onSuccess.call(this, collection, opts);
            else collection.trigger('fetch:success read:success', collection, opts);
        },
        fetchInValid: function(opts, collection) {
            if (opts.onError) opts.onError.call(this, opts, collection);
            else collection.trigger('fetch:error read:error', opts, collection);
        },
        templateHelper: function(str) {
            return str;
        },
        messagingResponse: function(channel) {
            return {
                get: Stubs.spies.messagingGet,
                reply: Stubs.spies.messagingGet,
                view: Marionette.View,
                title: 'title',
                channelName: channel,
                on: function(name, callback) {},
                trigger: function() {
                    return;
                }
            };
        },
        authValid: function() {
            var deferred = $.Deferred();
            return deferred.resolve(), deferred.promise();
        },
        authInvalid: function() {
            var deferred = $.Deferred();
            return deferred.reject(), deferred.promise();
        },
        createEmptyCollection: function() {
            return new Backbone.Collection();
        },
        getAppletStorageModel: function(storage, value) {
            var storageModel = new Backbone.Model({
                key: 'value'
            });
            return storageModel;
        },
        getSessionModel: function(channel) {
            return channel + '_value';
        },
        getModel: function(channel) {
            if (channel === 'globalDate') {
                return new Backbone.Model({
                    customFromDate: "05/30/2014",
                    customToDate: "05/30/2017",
                    firstEventDate: "04/07/1935",
                    fromDate: "05/30/2014",
                    lastEventDate: "11/30/2016",
                    selectedId: "customRangeApplyGlobal",
                    toDate: "05/30/2017"
                });
            } else {
                return {
                    test: 'value'
                };
            }
        },
        getCurrentPatient: function() {
            return mockPatient;
        },
        setCurrentPatient: function(patient) {
            if (patient instanceof Backbone.Model)
                mockPatient.set(patient.attributes);
            else if (patient instanceof Object)
                mockPatient.set(patient);
            else throw "Cannot set patient";
        },
        getCurrentWorkspaceAndContext: function() {
            return mockCurrentWorkspaceAndContextModel;
        },
        currentContextId: function() {
            return 'patient';
        },
        setCurrentWorkspaceAndContext: function(workspaceAndContext) {
            if (workspaceAndContext instanceof Backbone.Model)
                mockCurrentWorkspaceAndContextModel.set(workspaceAndContext.attributes);
            else if (workspaceAndContext instanceof Object)
                mockCurrentWorkspaceAndContextModel.set(workspaceAndContext);
            else throw "Cannot set workspaceAndContext";
        },
        getUserSession: function() {
            var userSession = new Backbone.Model({
                site: '9E7A'
            });

            return userSession;
        },
        utilsExtract: function(json, subObject, attributesObject) {
            if (subObject) {
                for (var i in attributesObject) {
                    var attribute = attributesObject[i];
                    if (subObject[attribute]) {
                        json[i] = subObject[attribute];
                    }
                }
            }
            return json;
        },
        utilsFormatDate: function(date, displayFormat, sourceFormat) {
            if (!sourceFormat) {
                sourceFormat = "YYYYMMDDHHmmssSSS";
            }

            return moment(date, sourceFormat).format(displayFormat);
        },
        setPatientList: function(patients) {
            if (patients instanceof Backbone.Collection) {
                mockPatientList.set(patients.toJSON());
            } else if (patients instanceof Array) {
                mockPatientList.set(patients);
            } else throw "Cannot set patient list";
        },
        getPatientList: function(collection) {
            collection.set(mockPatientList.toJSON());
            return collection;
        },
        formatDate: function(date) {
            return date;
        },
        getTimeSince: function(date) {
            return {
                timeSince: date,
                count: 1,
                timeUnits: 'timeUnits',
                timeSinceDescription: 'finalResultText',
                isRecent: false,
                isValid: false
            };
        },
        crsUtil: {
            crsAttributes: {
                CRSDOMAIN: 'kind'
            },
            domain: {
                PROBLEM: 'Problem'
            }
        }
    }; 

    var Spies = {
        spies: { //dummy methods
            initAllRouters: jasmine.createSpy('initAllRouters'),
            navigate: jasmine.createSpy('navigate'),
            trigger: jasmine.createSpy('trigger'),
            start: jasmine.createSpy('start')
        },
        spyOns: { //methods that will execute
            messagingGet: function(input) {
                return input;
            },
            getUrl: function(url) {
                return url;
            }
        },
        resetSpies: function(spies) {
            spies = spies || this.spies;
            _.each(spies, function(spy, spyName) {
                if (_.isObject(spy)) this.resetSpies(spy);
                else spy.calls.reset();
            }, this);
        }
    };

    //configure spies
    _.each(Spies.spyOns, function(method, name) {
        spyOn(this.spyOns, name).and.callThrough();
    }, Spies);


    //merge objects together
    _.merge(Spies.spies, Spies.spyOns); //merge spies so all can be reset
    _.merge(Stubs, Spies); //merge spies into stubs so methods can be access in UTs

    //create ADK stub
    window.ADK = {};
    _.set(ADK, 'ResourceService.fetchCollection', Stubs.fetchValid);
    _.set(ADK, 'PatientRecordService.fetchCollection', Stubs.fetchValid);
    _.set(ADK, 'PatientRecordService.getRecentPatients', Stubs.getPatientList);
    _.set(ADK, 'ResourceService.createEmptyCollection', Stubs.createEmptyCollection);
    _.set(ADK, 'PatientRecordService.createEmptyCollection', Stubs.createEmptyCollection);
    _.set(ADK, 'utils.helpUtils.getUrl', Stubs.templateHelper);
    _.set(ADK, 'Messaging.request', Stubs.messagingResponse);
    _.set(ADK, 'Messaging.getChannel', Stubs.messagingResponse);
    _.set(ADK, 'Messaging.trigger', Stubs.spies.trigger);
    _.set(ADK, 'UserService.authenticate', Stubs.authValid);
    _.set(ADK, 'ADKApp.initAllRouters', Stubs.spies.initAllRouters);
    _.set(ADK, 'Navigation.navigate', Stubs.spies.navigate);
    _.set(ADK, 'WorkspaceContextRepository.userDefaultScreen', 'userDefaultScreen');
    _.set(ADK, 'WorkspaceContextRepository.currentWorkspaceAndContext', Stubs.getCurrentWorkspaceAndContext);
    _.set(ADK, 'WorkspaceContextRepository.currentContextId', Stubs.currentContextId);
    _.set(ADK, 'SessionStorage.getAppletStorageModel', Stubs.getAppletStorageModel);
    _.set(ADK, 'SessionStorage.get.sessionModel', Stubs.getSessionModel);
    _.set(ADK, 'SessionStorage.getModel', Stubs.getModel);
    _.set(ADK, 'PatientRecordService.getCurrentPatient', Stubs.getCurrentPatient);
    _.set(ADK, 'PatientRecordService.setCurrentPatient', Stubs.setCurrentPatient);
    _.set(ADK, 'utils.helpUtils.getUrl', Stubs.spies.getUrl);
    _.set(ADK, 'utils.tooltipMappings.patientSync_mySite', 'My Site');
	_.set(ADK, 'utils.helpUtils.getUrl', Stubs.spies.getUrl);
    _.set(ADK, 'utils.formatDate', Stubs.formatDate);
    _.set(ADK, 'utils.getTimeSince', Stubs.getTimeSince);
    _.set(ADK, 'utils.crsUtil', Stubs.crsUtil);
    _.set(ADK, 'UserService.getUserSession', Stubs.getUserSession);
    _.set(ADK, 'CCOWService.start', Stubs.spies.start);
    _.set(ADK, 'AppletViews.GridView', Marionette.CollectionView);
    _.set(ADK, 'Applets.BaseGridApplet', Marionette.CollectionView);
    _.set(ADK, 'Applets.BaseGridApplet.DataGrid', Marionette.View);
    _.set(ADK, 'Applets.BaseGridApplet.DataGrid.DataGridRow', Marionette.View);
    _.set(ADK, 'AppletViews.PillsGistView', Marionette.View);
    _.set(Backgrid, 'StringCell', Marionette.View);
    _.set(Backgrid, 'HandlebarsCell', Marionette.View);
    _.set(ADK, 'utils.extract', Stubs.utilsExtract);
    _.set(ADK, 'utils.formatDate', Stubs.utilsFormatDate);
    _.set(ADK, 'Checks.CheckModel', Backbone.Model);
    _.set(ADK, 'Resources.Model', Backbone.Model);
    _.set(ADK, 'Resources.Collection', Backbone.Collection);
    _.set(ADK, 'ResourceService.PageableCollection', Backbone.Collection);
    _.set(ADK, 'Views.EventGist', Marionette.View);
    _.set(ADK, 'Views.EventGist.getRowItem', Marionette.View);

    //ADK.UI.Form stubs
    var RecursiveView = Marionette.CompositeView.extend({
        initialize: function(options) {
            this.formModel = options.formModel;
            var items = this.model.get('items');
            if (_.isArray(items)) this.collection = new Backbone.Collection(items);
            if (!this.modelEvents) this.modelEvents = {};
            _.each(this.model.get('modelListeners'), function(listenerName) {
                this.modelEvents['change:' + listenerName] = 'render';
                this.listenTo(this.formModel, 'change:' + listenerName, this.render);
            }, this);
        },
        serializeModel: function() {
            var modelAttributes = (this.model) ? _.clone(this.model.attributes) : {};
            var formModelAttributes = (this.formModel) ? _.clone(this.formModel.attributes) : {};
            var out = _.extend(modelAttributes, formModelAttributes);
            if (!out.id && out.name) out.id = out.name;
            return out;
        },
        childView: RecursiveView,
        childViewOptions: function() {
            return {
                'formModel': this.model
            };
        },
        getTemplate: function() {
            if (this.model.get('template')) return Handlebars.compile(this.model.get('template'));
            var templateStr = '<{{control}} {{#if id}}id="{{id}}"{{/if}} ' +
                '{{#if name}}name="{{name}}"{{/if}} ' +
                '{{#if label}}label="{{label}}"{{/if}} ' +
                '{{#if title}}title="{{title}}"{{/if}}>' +
                '</{{control}}>';
            if (this.model.get('control') === 'container') templateStr.replace('{{control}}', 'div');
            return Handlebars.compile(templateStr);
        },
        onRender: function() {
            var control = this.model.get('control');
            var extraClasses = this.model.get('extraClasses');
            if (extraClasses) this.$(':first-child').addClass(extraClasses);
            if (control !== 'container' && control !== 'button') this.$(':first-child').addClass('control ' + this.model.get('control') + '-control form-group');
        }
    });

    _.set(ADK, 'UI.Form', Marionette.CompositeView.extend({
        tagName: 'form',
        className: "adk-form form-container",
        model: new Backbone.Model(),
        template: _.template('<p class="sr-only">* indicates a required field.</p>'),
        attributes: {
            'action': '#'
        },
        initialize: function(opts) {
            this.model.errorModel = new Backbone.Model();
            if (this.modelEvents) this.bindEntityEvents(this.model, this.modelEvents);
            this.collection = new Backbone.Collection(this.fields);
            this.onInitialize.call(this, opts);
        },
        childView: RecursiveView,
        childViewOptions: function() {
            return {
                'formModel': this.model
            };
        },
        onInitialize: _.noop
    }));

    //ADK.UI.AlertDropdown stubs
    var MockRowView = Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile('<a>{{label}}</a>')
    });

    var MockDropdownListView = Marionette.CompositeView.extend({
        template: Handlebars.compile([
            '{{#if dropdownTitle}}<div class="dropdown-header">',
            '<p>',
            '<strong>{{dropdownTitle}}</strong>',
            '</p>',
            '</div>{{/if}}',
            '<ul class="dropdown-body list-group"></ul>',
        ].join('\n')),
    });

    _.set(ADK, 'UI.AlertDropdown', Marionette.LayoutView.extend({
        DropdownListView: MockDropdownListView,
        RowView: MockRowView,
        template: function() {
            return Handlebars.compile('<div /><div class="dropdownRegion" />');
        },
        regions: {
            DropdownRegion: '.dropdownRegion'
        },
        onBeforeInitialize: function() {},
        initialize: function() {
            this.onBeforeInitialize();
            var DropDownView = this.DropdownListView.extend({
                collection: this.collection,
                childView: this.RowView
            });
            this.dropDownView = new DropDownView();
        },
        onRender: function() {
            this.addRegion('DropdownRegion', dropDownView);
        }
    }));

    _.set(ADK, 'UI.AlertDropdown.RowView', MockRowView);

    _.set(ADK, 'UI.AlertDropdown.DropdownListView', MockDropdownListView);

    //override bootstrap methods
    $.fn.button = jasmine.createSpy('bootstrapButton');

    //Test the test mechamism
    describe('The test region is able to create a view', function() {
        Stubs.bootstrapViewTest();
        it('which will go through a full lifecycle', function() {
            var View = Backbone.Marionette.ItemView.extend({
                'template': Handlebars.compile('<div class="test-class">test</div>')
            });
            var view = new View();
            Stubs.testRegion.show(view);
            expect(view._isRendered).toBe(true);
            Stubs.testRegion.empty();
            expect($('.testRegion')).toBeEmpty();
        });
    });


    return Stubs;
});