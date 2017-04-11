define([
    'backbone',
    'marionette',
    'hbs!app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRow',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medNameRowPanelView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollection',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowHeader/graphingGroupCollectionView'
], function(Backbone, Marionette, MedNameRow, MedNameRowPanelView, GraphingGroupCollection, GraphingGroupCollectionView) {
    'use strict';

    var MedicationLayout = Backbone.Marionette.LayoutView.extend({
        template: MedNameRow,
        className: 'medication-layout-view panel panel-default',
        ui: {
            collapse_container: '.collapse',
            medsItemRow: '.meds-item',
            medicationNameLayoutRow: '[data-medication-container=medication-list]',
            medNameListToolabr: '[data-toolbar=appletToolbar]'
        },
        attributes: function() {
            var dataCode = this.model.has('dataCode') ? this.model.get('dataCode') : '';
            return {
                role: 'presentation',
                tabindex: '0',
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
            medicationDetailPanel: '.panel-collapse',
            medNameList: '[data-toolbar=appletToolbar]'
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
        addToolbar: function() {
            var self = this;
            if (!this.toolbarView) {
                this.toolbarView = new ADK.Views.AppletToolbarView({
                    targetView: self,
                    targetElement: {
                        model: self.model.get('medications').at(0)
                    },
                    buttonTypes: ['infobutton', 'detailsviewbutton'],
                    detailViewEvent: {
                        click: function() {
                            this.$el.tooltip('hide');
                            self.ui.collapse_container.collapse('toggle');
                            self.panelOpen = !self.panelOpen;
                        }
                    }
                });
            }
            this.medNameList.show(this.toolbarView);
            this.toolbarView.show();
            this.ui.medNameListToolabr.attr('tabindex', '0');
            this.ui.medNameListToolabr.focus();
        },
        onClick: function(event) {
            function isScrolledIntoView(el) {
                var $el = $(el);
                var $container = $('.grid-applet-panel');

                var containerViewTop = $container.scrollTop();
                var containerViewBottom = containerViewTop + $container.height();

                if (!$el.offset()) return;
                var elTop = $el.offset().top;
                var elBottom = elTop + $el.height();

                return ((containerViewTop < elTop) && (containerViewBottom > elBottom));
            }
            $(this.medicationDetailPanel.$el.selector).on('hide.bs.collapse', function(e) {
                if (event.currentTarget !== e.currentTarget) {
                    if (isScrolledIntoView(event.currentTarget) === false) {
                        event.currentTarget.scrollIntoView(false);
                    }
                }
            });

            this.trigger('toolbar');
            if (!this.panelOpen) {
                if (this.showingToolbar) {
                    this.onOtherChildClicked();
                } else {
                    this.addToolbar();
                    this.showingToolbar = true;
                    this.ui.medsItemRow.addClass('activerow');
                    this.ui.medsItemRow.removeClass('meds-item');
                }
            }

            if (!this.hasDetailPanel) {
                this.createDetailPanel();
                this.hasDetailPanel = true;
            }
        },
        onOtherChildClicked: function() {
            if (this.showingToolbar) {
                this.toolbarView.hide();
                this.showingToolbar = false;
                this.ui.medsItemRow.removeClass('activerow');
                this.ui.medsItemRow.addClass('meds-item');
            }
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
        },
        onBeforeDestroy: function() {
            if (this.toolbarView) {
                this.toolbarView.destroy();
            }
        }
    });

    return MedicationLayout;
});