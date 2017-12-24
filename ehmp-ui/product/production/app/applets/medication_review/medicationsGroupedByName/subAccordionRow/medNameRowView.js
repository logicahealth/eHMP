define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRow',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medNameRowPanelView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollection',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollectionView',
    'jquery.scrollTo'
], function(Backbone, Marionette, MedNameRow, MedNameRowPanelView, GraphingGroupCollection, GraphingGroupCollectionView) {
    'use strict';

    var MedicationLayout = Backbone.Marionette.LayoutView.extend({
        template: MedNameRow,
        className: 'medication-layout-view panel panel-default',
        ui: {
            collapse_container: '.collapse',
            medsItemRow: '.meds-item',
            medicationNameLayoutRow: '[data-medication-container=medication-list]',
            medsReviewContainer: '.meds-review-container'
        },
        tileOptions: {
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'infobutton'
                }, {
                    type: 'detailsviewbutton',
                    onClick: function(params, event) {
                        this.onClick(event, params);
                    }
                }]
            }
        },
        attributes: function() {
            var dataCode = this.model.has('dataCode') ? this.model.get('dataCode') : '';
            return {
                role: 'presentation',
                'data-code': dataCode
            };
        },
        events: {
            'click .panel-heading > .row': 'onClick',
            'shown.bs.collapse': function(event) {
                event.stopPropagation();
            },
            'hidden.bs.collapse': function(event) {
                event.stopPropagation();
            },
            'otherChildClicked': 'onOtherChildClicked'
        },
        regions: {
            medicationGroup: '.medication-group',
            medicationDetailPanel: '.panel-collapse'
        },
        initialize: function(options) {
            this.model = options.model;
            this.model.set("appletInstanceId", options.appletInstanceId);
        },
        onRender: function() {
            var graphingGroup = new GraphingGroupCollection(this.model.get('medications'), {
                parse: true
            });
            this.showChildView('medicationGroup', new GraphingGroupCollectionView({
                model: this.model,
                collection: graphingGroup
            }));
        },
        elementInView: function elementInView(el) {
            var elBounds = el.getBoundingClientRect();
            return (
                elBounds.top >= 0 &&
                elBounds.bottom <= this.ui.medsReviewContainer.innerHeight
            );
        },
        onClick: function(event, params) {
            this.trigger('panelClick');

            this.ui.collapse_container.collapse('toggle');
            this.panelOpen = !this.panelOpen;

            if (this.panelOpen) {
                var region = this.getRegion('medicationDetailPanel');
                this.listenToOnce(region, 'show', function() {
                    var $a = this.$el.find('a:first');
                    $a.focus();
                    var $container = this.$el.closest('.meds-review-container');
                    var $row = this.ui.medsItemRow.parent();
                    $row = $row.prev();
                    if($row.length) {
                        $container.scrollTo($row, 250, {offset: 100});
                    }
                });

                this.createDetailPanel();
                this.hasDetailPanel = true;
            } else {
                var $el = _.get(params, '$el') || this.$(event.currentTarget);
                if (_.get($el,'[0].type') !== 'button') {
                    $el = $el.find('.dropdown--quickmenu > button');
                }
                $el.focus();
            }
        },
        onOtherChildClicked: function() {
            if (this.panelOpen) {
                this.ui.collapse_container.collapse('toggle');
                this.panelOpen = false;
            }
        },
        createDetailPanel: function() {
            this.showChildView('medicationDetailPanel', new MedNameRowPanelView({
                collection: this.model.get('medications'),
                model: this.model.get('medications').models[0]
            }));
        }
    });

    return MedicationLayout;
});