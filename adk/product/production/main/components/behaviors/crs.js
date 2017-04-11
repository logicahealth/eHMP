define([
    'backbone',
    'marionette',
    'api/Messaging',
    'api/ResourceService',
    'handlebars',
    'main/adk_utils/crsUtil',
    'main/ui_components/modal/component.js'
], function(Backbone, Marionette, Messaging, ResourceService, Handlebars, CrsUtil, ModalComponent) {
    'use strict';

    var CRS = Backbone.Marionette.Behavior.extend({
        initialize: function() {
            this.crsCollection = new Backbone.Collection();
            this.bindEntityEvents(this.crsCollection, this.getOption('crsEvents'));
        },
        events: {
            'fetch:crs': function(event, target) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.getCrs(target);
            }
        },
        crsEvents: {
            'crs-fetch-success': function(collection, resp, itemClicked) {
                var items = resp.data;
                var displayedCrsApplets = [];
                var dataCode = itemClicked.model.get('dataCode');
                var styles = '[data-code="' + dataCode + '"]{ background-color:#F4FFAB !important; border:#132F50 solid 2px !important; }' + '[data-code="' + dataCode + '"] > .table-row > div:hover{ background-color:#EEFF7F !important; }';
                var screenReaderFeedback = CrsUtil.screenReaderFeedback;
                var appletManifestApplets = ADK.Messaging.request('AppletsManifest');
                if (items && items.length > 0) {
                    //check current workspace vs results set
                    var currentDomains = [];
                    appletManifestApplets.applets.filter(function(item) {
                        if (_.findWhere(ADK.ADKApp.currentScreen.applets, {
                                id: item.id
                            }) && item.crsDomain) {
                            currentDomains.push(item.crsDomain);
                            displayedCrsApplets.push(item.title);
                        }
                    });
                    currentDomains = _.uniq(currentDomains);
                    var itemFound = false;
                    //check items vs currentDomains
                    _.forEach(currentDomains, function(domain) {
                        _.forEach(items, function(item) {
                            if (item['concept.domain'] === domain && !itemFound) {
                                itemFound = item["code.systems"][0].codes.length > 0 ? true : false;
                            }
                        });
                    });
                    if (!itemFound) {
                        var problemText = itemClicked.model.get('groupName') ? itemClicked.model.get('groupName') : itemClicked.model.get('problemText') ? itemClicked.model.get('problemText') : '';
                        var errorWithOrginatorName = 'No relationships found for ' + ' <span class="text-capitalize"><strong>' + problemText + '</strong></span>' + ' on this workspace. Medications, Laboratory and Vitals applets can display relationships.';
                        this.createNotification(errorWithOrginatorName);
                    } else {
                        //if empty display Other message
                        var itemClickedDomain = itemClicked.model.get('crsDomain');
                        var adkApp = ADK.ADKApp;
                        var currentApplets = adkApp.currentScreen.applets;
                        var currentScreen = adkApp.currentWorkspace;
                        var formattedDataItems = '';
                        var allIds = [];
                        CrsUtil.removeStyle(this);
                        var crsIcons = this.$el.closest('body').find(CrsUtil.getCrsIconHeaderClassName());
                        _.each(crsIcons, function(icon) {
                            if (_.indexOf(displayedCrsApplets, icon.parentElement.parentElement.title) >= 0) {
                                icon.classList.remove('hide');
                            }
                        });
                        _.forEach(items, function(item) {
                            _.forEach(item['code.systems'], function(systems) {
                                _.forEach(systems.codes, function(value, key) {
                                    allIds.push('[data-code~="' + value.code + '"]');
                                });
                            });
                        });
                        _.forEach(allIds, function(value, key) {
                            if (key === allIds.length - 1) {
                                formattedDataItems = formattedDataItems + value;
                            } else {
                                formattedDataItems = formattedDataItems + value + ',';
                            }
                            styles += value + ' { background-color:#F4FFAB !important; border:rgb(204, 153, 102) solid 2px !important; }' + value + ' > .table-row > div:hover { background-color:#EEFF7F !important; }';
                        });
                    }
                } else {
                    var zeroItemProblemText = itemClicked.model.get('groupName') ? itemClicked.model.get('groupName') : itemClicked.model.get('problemText') ? itemClicked.model.get('problemText') : '';
                    var zeroItemErrorWithOrginatorName = 'No relationships exist in the eHMP data for the '  + '<span class="text-capitalize"><strong>' + zeroItemProblemText + '</strong></span>' + ' at this time.';
                    this.createNotification(zeroItemErrorWithOrginatorName);
                }
                $('<style></style>', {
                    type: 'text/css',
                    id: CrsUtil.getCssTagName(),
                }).appendTo('head').append(styles);
                var highlightedItems = CrsUtil.findCurrentCRSItems();
                if (highlightedItems) {
                    this.createButtons();
                    $('#aria-live-assertive-region p').replaceWith('<p>' + screenReaderFeedback.FOUND_RELATED_CONCEPT + '</p>');
                } else {
                    $('#aria-live-assertive-region p').replaceWith('<p>' + screenReaderFeedback.FOUND_NO_RELATED_CONCEPT + '</p>');
                }
            },
            'crs-fetch-error': function(collection, resp, options) {
                this.createNotification(CrsUtil.messages.ERROR_MESSAGE);
            }
        },
        createButtons: function() {
            //Append buttons to page
            //Both the buttons and their events get cleaned up in crsUtil.removeStyle
            CrsUtil.buttonContainer = $("<div/>")[0];
            CrsUtil.buttonContainer.setAttribute('class', 'crs-508-controller');
            $('body').append(CrsUtil.buttonContainer);
            $(CrsUtil.buttonContainer).append('<button class="crsFocus" accesskey="q" id="crsgoback"><button class="crsFocus" accesskey="w" id="crsgoforward">');
            //Put events on buttons
            $(CrsUtil.navigate.CRS_GO_BACK).on(CrsUtil.navigate.CRS_508_EVENT, this.goBack);
            $(CrsUtil.navigate.CRS_GO_FORWARD).on(CrsUtil.navigate.CRS_508_EVENT, this.goForward);
        },
        goBack: function() {
            var activeItems = CrsUtil.activeItems;
            // this ternary verifies if index is less than one and makes it zero if so
            // if not, we can subtract
            CrsUtil.activeItemOn = (CrsUtil.activeItemOn < 1 ? 0 : CrsUtil.activeItemOn - 1);
            activeItems.eq(CrsUtil.activeItemOn).trigger('focus');
        },
        goForward: function() {
            var activeItems = CrsUtil.activeItems;
            // this ternary verifies if we are at the last element
            // if so, we don't add the index
            CrsUtil.activeItemOn = (CrsUtil.activeItemOn === (activeItems.length - 1) ? CrsUtil.activeItemOn : CrsUtil.activeItemOn + 1);
            if (CrsUtil.activeItemOn === activeItems.length - 1) {
                $('#aria-live-assertive-region p').replaceWith('<p>' + CrsUtil.screenReaderFeedback.END_OF_LIST + '</p>');
            }
            activeItems.eq(CrsUtil.activeItemOn).trigger('focus');
        },
        createNotification: function(message) {
            var ContentView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile(message),
                tagName: 'p'
            });
            var modalOptions = {
                size: 'medium',
                backdrop: 'static',
                draggable: false,
                title: 'Clinically Related Concept',
            };
            var modalView = new ModalComponent({
                view: new ContentView(),
                options: modalOptions,
                events: {
                    'click #modal-close-button': function() {
                        CrsUtil.removeStyle(this);
                    },
                    'click .close': function() {
                        CrsUtil.removeStyle(this);
                    }
                }
            });
            this.getOption('view').trigger('modal.show');
            modalView.show();
        },
        getCrs: function(itemClicked) {
            var domains = [];
            var itemClickedModel = itemClicked.model;
            domains.push(CrsUtil.domain.MEDICATION);
            domains.push(CrsUtil.domain.LABORATORY);
            domains.push(CrsUtil.domain.VITAL);
            var fetchOptions = {
                resourceTitle: 'concept-relationships',
                criteria: {
                    'target.domains': domains,
                    'concept.id': itemClickedModel.get('dataCode'),
                    'concept.domain': itemClickedModel.get('crsDomain')
                },
                cache: false,
                onSuccess: function(collection, resp, options) {
                    collection.trigger('crs-fetch-success', collection, resp, itemClicked);
                },
                onError: function(collection, resp, options) {
                    collection.trigger('crs-fetch-error', collection, resp, itemClicked);
                },
            };
            ResourceService.fetchCollection(fetchOptions, this.crsCollection);
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.crsCollection, this.getOption('crsEvents'));
        }
    });
    return CRS;
});