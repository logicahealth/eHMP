define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medNameRowPanel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medLeftSideList/medLeftSideListView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/medRightSideDetailView',
    'app/applets/medication_review/medicationsUngrouped/medicationOrderCollection'
], function(Backbone, Marionette, MedNameRowPanel, MedLeftSideListView, MedRightSideDetailView, MedicationOrderCollection) {
    'use strict';

    var MedicationPanelLayout = Backbone.Marionette.LayoutView.extend({
        template: MedNameRowPanel,
        className: 'panel-body',
        attributes: {
            'role' : 'tablist',
            'data-appletid': 'medication_review'
        },
        regions: {
            orderHistoryList: '.order-historylist',
            medicationDetail: '.medication-detail',
        },
        initialize: function(options) {
            this.model = options.model;
            this.collection = options.collection;
        },
        onBeforeShow: function() {
            var SortedByOverallStopCollection = Backbone.Collection.extend({
                comparator: function(med) {
                    return -med.getEarlierStopAsMoment();
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
            this.$('[data-detail=content]').focus();
            this.$(event.currentTarget).find('a').attr('accesskey', 'm');
            this.$(event.currentTarget).siblings().find('a').removeAttr('accesskey');
        },
        templateHelpers: function() {
            return {
                modifiedName: this.model.getModifiedName()
            };
        }
    });

    function getMatchingMeds(params, medModel) {
        var deferredResponse = $.Deferred();
        var fetchOptions = {
            cache: true,
            resourceTitle: 'patient-record-med'
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
                        model: matchingMeds.findWhere({uid: params.uid})
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