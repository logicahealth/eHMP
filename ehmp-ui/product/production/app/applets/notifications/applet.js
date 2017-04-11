 define([
     'backbone',
     'marionette',
     'underscore',
     'handlebars',
     'hbs!app/applets/notifications/templates/summaryTemplate',
     'app/applets/notifications/applicationHeaderIcon'
 ], function(Backbone, Marionette, _, Handlebars, summaryTemplate, NotificationsHeaderIcon) {
     "use strict";

     var PriorityMappings = {
         'ehmp/msg/priority/alert': {
             code: '0',
             text: 'Alert'
         },
         'ehmp/msg/priority/alarm': {
             code: '1',
             text: 'Alarm'
         },
         'ehmp/msg/priority/high': {
             code: '2',
             text: 'High'
         },
         'ehmp/msg/priority/medium': {
             code: '3',
             text: 'Med'
         },
         'ehmp/msg/priority/warning': {
             code: '4',
             text: 'Warn'
         },
         'ehmp/msg/priority/low': {
             code: '5',
             text: 'Low'
         }

     };

     var PriorityGroups = {
         '0': 'ALERTS',
         '1': 'ALARMS',
         '2': 'HIGH PRIORITY',
         '3': 'MEDIUM PRIORITY',
         '4': 'WARNINGS',
         '5': 'LOW PRIORITY'
     };

     var providerSummaryColumn = {
         name: 'patientName',
         label: 'Summary',
         cell: 'handlebars',
         template: summaryTemplate,
         groupable: true,
         groupableOptions: {
             innerSort: 'patientName',
         }
     };

     var patientSummaryColumn = {
         name: 'title',
         label: 'Summary',
         cell: 'string',
         groupable: true,
         groupableOptions: {
             innerSort: 'title',
         }
     };
     var priorityColumn = {
         name: 'priorityText',
         label: 'Priority',
         cell: 'string',
         groupable: true,
         direction: 'ascending',
         groupableOptions: {
             primary: true,
             innerSort: 'priorityCode',
             groupByFunction: function(collectionElement) {
                 return collectionElement.model.attributes.priorityCode;
             },
             groupByRowFormatter: function(item) {
                 return PriorityGroups[item];
             }
         }
     };

     var requestedOnColumn = {
         name: 'requestedOnDisplay',
         label: 'Date',
         cell: 'string',
         groupable: true,
         groupableOptions: {
             innerSort: 'requestedOnFormatted',
             groupByFunction: function(collectionElement) {
                 return collectionElement.model.get("requestedOnFormatted").toString().substr(0, 8);
             },
             groupByRowFormatter: function(item) {
                 return moment(item, 'YYYYMMDD').format('MM/DD/YYYY');
             }
         }
     };

     var contentColumn = {
         name: 'content',
         label: 'Message',
         cell: 'string',
         groupable: true,
         groupableOptions: {
             innerSort: 'content',
         }
     };
     var Columns = {
         provider: [providerSummaryColumn, priorityColumn, requestedOnColumn, contentColumn],
         patient: [patientSummaryColumn, priorityColumn, requestedOnColumn, contentColumn]
     };

     var NotificationsCollection = Backbone.Collection.extend({
         model: Backbone.Model.extend({
             //parse each model by adding formatted attributes
             parse: function(response) {
                 //parse contentString received as JSON: "contentString":{" \"title\" : \"..\", \"content\" : \"...\" "}
                 var contentString, obj = _.find(response.payload, 'contentString');
                 if (!_.isUndefined(obj)) {
                     var contentStringParsed;
                     contentString = obj.contentString;
                     if (!_.isUndefined(contentString) && _.isString(contentString) && !_.isEmpty(contentString)) {
                         try {
                             contentStringParsed = JSON.parse(contentString);
                         } catch (e) {
                             contentStringParsed = {
                                 title: '',
                                 content: ''
                             };
                         }
                         response.title = contentStringParsed.title;
                         response.content = contentStringParsed.content;
                     }
                 }

                 if (!_.isUndefined(response.requestedOn)) {
                     response.requestedOnDisplay = moment(response.requestedOn).format('MM/DD/YYYY HH:mm');
                     response.requestedOnFormatted = moment(response.requestedOn).format("YYYYMMDDHHmm");
                 }
                 if (!_.isUndefined(response.priority.coding) && response.priority.coding.length > 0) {
                     response.priority = response.priority.coding[0].code;
                     response.priorityText = PriorityMappings[response.priority].text;
                     response.priorityCode = PriorityMappings[response.priority].code;
                 }
                 if (!_.isUndefined(response.subject.reference) && _.isString(response.subject.reference)) {
                     var patient = response.subject.reference;
                     response.patientPID = patient.substring(patient.lastIndexOf('/') + 1);
                 }

                 response.patientName = '';
                 if (!_.isUndefined(response.subject.display)) {
                     response.patientName = response.subject.display;
                 }
                 response.summary = response.title + '\n' + response.patientName;
                 return response;
             }
         })
     });

     var isPatientView = function(options) {
         var requestView = ADK.Messaging.request('get:current:screen').config.id;
         return (requestView === 'notifications-full');
     };


     var AppletGridView = ADK.AppletViews.GridView.extend({
         // use super to reference ADK.GridViews's methods
         _super: ADK.AppletViews.GridView.prototype,
         initialize: function(options) {
             var self = this,
                 columns = Columns.provider;
             var siteCode = ADK.UserService.getUserSession().get('site'),
                 duz = ADK.UserService.getUserSession().get('duz')[siteCode];
             var recipientId = siteCode + ';' + duz;

             var url = 'resource/fhir/communicationrequest/' + recipientId;

             if (isPatientView(options)) {
                 var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                 if (currentPatient.has('pid')) {
                     url += '?subject=patient/' + currentPatient.get('pid');
                     columns = Columns.patient;
                 }
             }

             this.appletOptions = {
                 columns: columns,
                 groupable: true,
                 collection: new NotificationsCollection(),
                 fullCollection: new NotificationsCollection(),
                 filterFields: ['summary', 'priorityText', 'content'],

                 //Date range filter options

                 filterDateRangeEnabled: true,
                 filterDateRangeField: {
                     name: "requestedOnFormatted",
                     label: "Date"
                 }

             };

             this.appletOptions.collection.url = url;

             //FilterDateRangeView is looking for fetchOptions.customFilter
             this.appletOptions.collection.fetchOptions = {
                 criteria: {}
             };

             this.fetchCollection();

             // Event handler for receiving real time notifications
             this.listenTo(ADK.Messaging, 'notifications:realtime', function(notification) {
                 if (notification.target === recipientId) {
                     self.fetchCollection();
                 }
             });

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', this.refresh);

             // calling ADK.GridView's initialize method
             this._super.initialize.apply(this, arguments);
         },
         onRender: function() {
             this._super.onRender.apply(this, arguments);
         },
         onShow: function(options) {
             this.$el.find('#all-range-' + this.appletOptions.appletId).click();

             if (isPatientView(options)) {
                 var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                 if (currentPatient.has('displayName')) {
                     var patientName = currentPatient.get('displayName');

                     //Change applet's title for patient view in 'Notifications for <patientName>'
                     this.$el.parents('[data-appletid="notifications"]').find('.panel-title-label').text('Notifications for patient ' + patientName);
                     this.$el.parents('[data-appletid="notifications"]').find('.grid-applet-heading').attr('title', 'Notifications for patient ' + patientName);
                 }
             }

             this._super.onShow.apply(this, arguments);
         },
         triggerCollectionEvents: function(collection) {
             collection.trigger('fetchSuccessfull', collection);
             collection.trigger('fetch:success');
         },
         fetchCollection: function() {
             var self = this;
             this.appletOptions.collection.fetch({
                 success: function(collection) {
                     //default ascending priority sort
                     collection.set(_.sortBy(collection.models, function(obj) {
                         return obj.attributes.priorityCode;
                     }));

                     collection.originalModels = collection.toJSON();

                     self.triggerCollectionEvents(collection);
                 }
             });
         },
         refresh: function(e) {
             this.fetchCollection();
             this._super.refresh.apply(this, arguments);
         },
         // Custom date range filter function
         dateRangeRefresh: function(dateFieldName, filterOptions) {
             var fromDateFormatted = moment(filterOptions.fromDate, 'MM/DD/YYYY').startOf('day');
             var toDateFormatted = moment(filterOptions.toDate, 'MM/DD/YYYY').endOf('day');

             ADK.utils.filterCollectionByDateRange(this.appletOptions.collection, fromDateFormatted, toDateFormatted, dateFieldName);
             this.triggerCollectionEvents(this.appletOptions.collection);
         }
     });

     var applet = {
         id: "notifications",
         viewTypes: [{
             type: 'expanded',
             view: AppletGridView,
             chromeEnabled: true
         }],
         defaultViewType: 'expanded'
     };

     return applet;
 });