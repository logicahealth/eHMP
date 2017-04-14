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
    "main/components/views/appletViews/TileSortManager",
    '_assets/js/tooltipMappings'
], function($, _, Utils, Backbone, Handlebars, interventionsGistLayoutTemplate, interventionsGistChildTemplate, popoverTemplate, ResourceService, UserService, Messaging, BaseAppletItem, BaseGistView, ToolbarView, TileSortManager, TooltipMappings) {
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
                    var fillableDaysHasLabel = this.fillableDays.hasLabel;
                    if (fillableDaysHasLabel) {
                        var fillableDaysLabel = this.fillableDays.label;
                        return fillableDaysLabel;
                    }
                },
                isfacilityDesc: function() {
                    var fillableDaysHasLabel = this.fillableDays.description;
                    return fillableDaysHasLabel;
                },
                isNotActiveMeds: function() {
                    if (self.callingView.toLowerCase() === 'activemeds') {
                        return false;
                    }

                    return true;
                },
                modifiedName: function() {
                    if (self.callingView === 'activeMeds' && this.shortName) {
                        var fullName = this.normalizedName;
                        return new Handlebars.SafeString([
                            this.shortName,
                            ' <a class="more-name" data-toggle="collapse" href="#'+self.cid+'-name">...</a>',
                            '<div class="collapse" id="'+self.cid+'-collapse-name">'+fullName.substring(this.shortName.length)+'</div>'
                        ].join(''));
                    } else {
                        return this.normalizedName;
                    }
                },
                modifiedDescription: function() {
                    if (self.callingView === 'activeMeds' && this.shortDescription) {
                        var fullDescription = this.description;
                        return new Handlebars.SafeString([
                            this.shortDescription,
                            ' <a class="more-description" data-toggle="collapse" href="#'+self.cid+'-description">...</a>',
                            '<div class="collapse" id="'+self.cid+'-collapse-description">'+fullDescription.substring(this.shortDescription.length)+'</div>'
                        ].join(''));
                    } else {
                        return this.description;
                    }
                }
            };
        },
        events: {
            'click .more-name': 'toggleMore',
            'click .more-description': 'toggleMore',
            'show.bs.collapse': 'toggleMoreLinkText',
            'hide.bs.collapse': 'toggleMoreLinkText'
        },
        toggleMoreLinkText: function(e) {
            var link = e.target.nextElementSibling || e.target.previousElementSibling;
            $(link).text(function(i, currentText) {
                return currentText === '...' ? '<<<' : '...';
            });
        },
        toggleMore: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var collapseElement = this.$el.find('#'+this.cid+'-collapse-'+e.currentTarget.className.split(' ')[0].split('-')[1]);
            collapseElement.collapse('toggle');
            $(e.currentTarget).insertAfter(collapseElement);
        },
        initialize: function(options) {
            this.callingView = options.appletOptions.appletId;
            var buttonTypes = ['infobutton', 'detailsviewbutton', 'quicklookbutton'];
            if (!Messaging.request('get:current:screen').config.predefined) {
                buttonTypes.unshift('tilesortbutton');
            }

            this.toolbarOptions = {
                buttonTypes: buttonTypes
            };
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
        events: {
            'after:hidetoolbar': function(e) {
                this.$el.find('.dragging-row').removeClass('dragging-row');
            }
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
        onRender: function(){
            _.each(this.$('.toolbar-508'), function(span) {
                var tooltipKey = span.innerHTML;
                span.innerHTML = '( ' + TooltipMappings[tooltipKey] + ' )';
            });
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
        },
        behaviors: {
            Tooltip: {}
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
