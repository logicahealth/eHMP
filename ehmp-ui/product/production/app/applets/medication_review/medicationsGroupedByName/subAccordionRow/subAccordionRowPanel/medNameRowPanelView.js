define([
    'backbone',
    'underscore',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medNameRowPanel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medLeftSideList/medLeftSideListView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medRightSideDetail/medRightSideDetailView'
], function(Backbone, _, Marionette, MedNameRowPanel, MedLeftSideListView, MedRightSideDetailView) {
    'use strict';

    var MedicationPanelLayout = Backbone.Marionette.LayoutView.extend({
        template: MedNameRowPanel,
        className: 'panel-body',
        attributes: {
            'role': 'tablist',
            'data-appletid': 'medication_review'
        },
        regions: {
            orderHistoryList: '.order-historylist',
            medicationDetail: '.medication-detail',
        },
        collectionEvents: {
            'fetch:success': function(collection, resp) {
                var model = collection.findWhere({
                    uid: this.model.get('uid')
                });
                var attrs = _.extend(model.attributes, this.model.attributes);
                this.model.set(attrs);

                var medModel = this.model;
                var matchingMeds = collection.filter(function(model) {
                    return medModel.getDisplayName().value === model.getDisplayName().value;
                });
                collection.reset(matchingMeds);
            }
        },
        modelEvents: {
            'fetch:success': 'render'
        },
        initialize: function(options) {
            if (!this.model instanceof ADK.UIResources.Fetch.MedicationReview.Model) {
                this.model = new ADK.UIResources.Fetch.MedicationReview.Model(_.get(this, 'model.attributes'));
            }
        },
        onBeforeShow: function() {
            if (this.collection.isEmpty()) {
                this.collection.performFetch({ defaultCriteria: {}, modelUid: this.model.get('uid') });
            }

            this.showChildView('orderHistoryList', new MedLeftSideListView({
                model: this.model,
                collection: this.collection,
                parent: this
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

    var getDetailsView = function(params) {
        var collection = new ADK.UIResources.Fetch.MedicationReview.Collection();
        var model = new ADK.UIResources.Fetch.MedicationReview.Model(params.model.attributes, {
            parse: true
        });
        if (!model.has('qualifiedName')) {
            model.set('qualifiedName', params.model.get('qualified_name'));
        }
        return {
            view: MedicationPanelLayout.extend({
                collection: collection,
                model: model
            }),
            title: 'Medication - ' + model.getDisplayName().value,
            groupedMeds: collection
        };
    };

    var getDetailsModal = function(model, collection, triggerElement) {
        var medModel = new ADK.UIResources.Fetch.MedicationReview.Model(model.attributes);
        var params = {
            model: medModel
        };
        var response = getDetailsView(params);
        var modal = new ADK.UI.Modal({
            view: new response.view({
                model: medModel
            }),
            options: {
                triggerElement: triggerElement,
                size: 'xlarge',
                title: response.title,
                'nextPreviousCollection': collection,
                'nextPreviousModel': model
            },
            callbackFunction: getDetailsModal
        });

        modal.show();
    };

    var medicationChannel = ADK.Messaging.getChannel('medication_review');
    medicationChannel.reply('detailView', getDetailsView);
    medicationChannel.on('detailView', function(params) {
        getDetailsModal(params.model, params.collection, params.$el);
    });

    return MedicationPanelLayout;
});
