define([
    "jquery",
    "underscore",
    "main/Utils",
    "backbone",
    "handlebars",
    "hbs!main/components/views/appletViews/interventionsGistView/templates/interventionsGistLayout",
    "hbs!main/components/views/appletViews/interventionsGistView/templates/interventionsGistChild",
    "hbs!main/components/views/appletViews/sharedTemplates/gistPopover",
    "api/ResourceService",
    "api/UserService",
    "api/Messaging",
    'main/components/applets/baseDisplayApplet/baseDisplayAppletItem',
    'main/components/applets/baseDisplayApplet/baseGistView',
    "main/components/appletToolbar/appletToolbarView",
    "main/components/views/appletViews/TileSortManager"
], function($, _, Utils, Backbone, Handlebars, interventionsGistLayoutTemplate, interventionsGistChildTemplate, popoverTemplate, ResourceService, UserService, Messaging, BaseAppletItem, BaseGistView, ToolbarView, TileSortManager) {
    'use strict';

    var InterventionsGistItem = BaseAppletItem.extend({
        template: interventionsGistChildTemplate,
        getInterventionSeverityClass: function(interventionCount) {
            switch (interventionCount.toUpperCase()) {
                case '0':
                    return 'label label-danger';
                case '1':
                    return 'label label-warning';
                case 'EXP':
                    return 'expiredMedWarning';
                default:
                    return 'lineCorrection';
            }
        },
        onDestroy: function() {
            this.ui.popoverEl.popup('destroy');
        },
        templateHelpers: function() {
            var self = this;
            return {
                isfacilityLabel: function() {
                    var fillableDaysHasLabel = this.meds[0].get('fillableDays').hasLabel;
                    if (fillableDaysHasLabel) {
                        var fillableDaysLabel = this.meds[0].get('fillableDays').label;
                        return fillableDaysLabel;
                    }
                },
                isfacilityDesc: function() {
                    var fillableDaysHasLabel = this.meds[0].get('fillableDays').description;
                    return fillableDaysHasLabel;
                },
                isNotActiveMeds: function() {
                    if (self.callingView.toLowerCase() === 'activemeds') {
                        return false;
                    }

                    return true;
                },
                modifiedDescription: function() {
                    if (self.callingView === 'activeMeds' && self.overChars) {
                        if (this.isShortDescription) {
                            return new Handlebars.SafeString(self.shortDescription + ' ...<a href="#" class="morelink inline-display" title="Show Full Description">More</a>');
                        } else {
                            return new Handlebars.SafeString(self.originalDescription + '&nbsp;&nbsp;&nbsp;<a href="#" class="lesslink inline-display" title="Show Abbreviated Description">Less</a>');
                        }
                    } else {
                        return this.description;
                    }


                }
            };
        },
        events: {
            'click .morelink': 'onMoreClicked',
            'click .lesslink': 'onLessClicked'
        },
        modelEvents: {
            'change': 'render'
        },
        initialize: function(options) {
            this.callingView = options.appletOptions.appletId;
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];
            if (!Messaging.request('get:current:screen').config.predefined) {
                buttonTypes.unshift('tilesortbutton');
            }

            this.toolbarOptions = {
                targetElement: this,
                buttonTypes: buttonTypes
            };

            if (this.callingView === 'activeMeds') {
                var showChar = 100;
                var medicationName = this.model.get('name');
                var showLength;
                this.overChars = 0;
                this.originalDescription = this.model.get('description');
                if (this.originalDescription) {

                    this.overChars = (medicationName.length + this.originalDescription.length) - showChar;
                    // Zero out negative numbers
                    this.overChars = this.overChars > 0 ? this.overChars : 0;

                    if (this.overChars) {
                        showLength = this.originalDescription.length - this.overChars;
                        this.shortDescription = this.originalDescription.substr(0, showLength);
                        this.model.set('isShortDescription', true);
                    }
                }
            }


        },
        onMoreClicked: function(e) {
            e.preventDefault();
            this.model.set('isShortDescription', false);
        },
        onLessClicked: function(e) {
            e.preventDefault();
            this.model.set('isShortDescription', true);
        },
        onRender: function() {
            //this._base.onRender.apply(this, arguments);
            var severityCheck = this.$('[data-cell-instanceid="count_' + this.model.get('uid') + '"]');
            var severity = (this.getInterventionSeverityClass(severityCheck.text()));
            severityCheck.addClass(severity);

            var countText = severityCheck.text();
            if (countText === '-1') {
                countText = 'Unknown';
                severityCheck.text('NA');
            }
            this.createPopover();
        }
    });

    var InterventionsGist = BaseGistView.extend({
        template: interventionsGistLayoutTemplate,
        childView: InterventionsGistItem,
        className: 'faux-table-container',
        attributes: function() {
            var gridTitle = '';
            if (this.options) {
                gridTitle = this.options.appletConfig.title + ' Grid';
            }
            return {
                'role': 'grid',
                'aria-label': gridTitle
            };
        },
        initialize: function(options) {
            this.callingView = options.appletId;
            this.childViewOptions = {
                AppletID: this.AppletID,
                appletOptions: options
            };
            this.collectionParser = options.collectionParser || function(collection) {
                return collection;
            };
            this.collection.on("filterDone", function() {}, this);
            this.collection = options.collection;
            this.gistModel = options.gistModel;

            //this is the model for the outer part of the composite view
            this.model = new Backbone.Model({});

            this.model.set('gistHeaders', options.gistHeaders || {
                name: 'Medication',
                description: '',
                graphic: 'Change',
                age: 'Age',
                count: 'Refills',
                fillableStatus: 'fillableStatus'
            });

            this.model.set('appletID', this.AppletID);
            this.childViewContainer = ".gist-item-list";
        },
        templateHelpers: function() {
            var self = this;
            return {
                isNotActiveMeds: function() {
                    if (self.callingView.toLowerCase() === 'activemeds') {
                        return false;
                    }

                    return true;
                }
            };
        }
    });

    var InterventionsGistView = {
        create: function(options) {
            var interventionsGistView = new InterventionsGist(options);
            return interventionsGistView;
        },
        getView: function() {
            return InterventionsGist;
        }
    };

    return InterventionsGistView;
});