define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medNameRowPanel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medLeftSideList/medLeftSideListView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/medRightSideDetailView',
    'app/applets/medication_review/medicationsUngrouped/medicationOrderCollection'
    // 'jdsFilter'
], function(Backbone, Marionette, MedNameRowPanel, MedLeftSideListView, MedRightSideDetailView, MedicationOrderCollection) {
    'use strict';

    var MedicationPanelLayout = Backbone.Marionette.LayoutView.extend({
        template: MedNameRowPanel,
        className: 'panel-body top-padding-no bottom-padding-no',
        attributes: {
            'data-appletid': 'medication_review'
        },
        regions: {
            orderHistoryList: '.orderHistoryList',
            medicationDetail: '.medicationDetail',
        },
        initialize: function(options) {
            this.model = options.model;
            this.collection = options.collection;
        },
        onBeforeShow: function() {
            var SortedByOverallStopCollection = Backbone.Collection.extend({
                comparator: function(med) {
                    return -med.getEarlierStop().stoppedMoment;
                }
            });
            var self = this;
            this.showChildView('orderHistoryList', new MedLeftSideListView({
                model: this.model,
                collection: this.collection,
                parent: self
            }));

            this.medRightSideDetailView = new MedRightSideDetailView({
                model: this.model
            });
            this.showChildView('medicationDetail', this.medRightSideDetailView);
        },
        updateDetailView: function(model) {
            this.medRightSideDetailView.model = model;
            this.medRightSideDetailView.render();
        },
        templateHelpers: function() {
            return {
                modifiedName: this.model.getModifiedName()
            };
        }
    });

    function getMatchingMeds(params, medModel) {
        // var filterObject;
        // var filter;
        var deferredResponse = $.Deferred();
        // if (medModel.getDisplayName().property === 'name') {
        // filterObject = ['ilike', 'name', medModel.getDisplayName().value + '%'];
        //     filter = 'ilike("name","' + medModel.getDisplayName().value + '%")';
        // } else {
        // filterObject = ['eq', medModel.getDisplayName().property, medModel.getDisplayName().value];
        //     filter = 'ilike("' + medModel.getDisplayName().property + '", "' + medModel.getDisplayName().value + '%")';
        // }

        var fetchOptions = {
            cache: true,
            resourceTitle: 'patient-record-med'
                // criteria: {
                //     // filter: jdsFilter.build(filterObject)
                //     filter: filter
                // },
        };

        fetchOptions.onSuccess = function(collection, resp) {
            var filteredItems = _.filter(collection.models, function(model) {
                return medModel.getDisplayName().value !== model.getDisplayName().value;
            });
            collection.remove(filteredItems);
            deferredResponse.resolve(collection);
        };
        ADK.PatientRecordService.fetchCollection(fetchOptions, new MedicationOrderCollection());

        return deferredResponse.promise();
    }

    var medicationChannel = ADK.Messaging.getChannel("medication_review");
    medicationChannel.reply('detailView', function(params) {
        var deferredResponse = $.Deferred();
        var fetchOptions = {
            cache: true,
            resourceTitle: 'patient-record-med',
            criteria: {
                "uid": params.uid
            },
        };
        fetchOptions.onSuccess = function(collection, resp) {
            var matchingMedsDeferredResponse = getMatchingMeds(params, collection.at(0));
            matchingMedsDeferredResponse.done(function(matchingMeds) {

                deferredResponse.resolve({
                    view: new MedicationPanelLayout({
                        collection: matchingMeds,
                        model: matchingMeds.at(0)
                    }),
                    title: "Medication - " + collection.first().get("name"),
                    groupedMeds: matchingMeds
                });
            });
        };
        ADK.PatientRecordService.fetchCollection(fetchOptions, new MedicationOrderCollection());
        return deferredResponse.promise();
    });
    return MedicationPanelLayout;
});