/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'highcharts',
    'hbs!app/applets/stackedGraph/list/chartsCompositeViewTemplate',
    'app/applets/stackedGraph/list/rowItemView',
    'app/applets/medication_review/medicationResourceHandler',
    'app/applets/medication_review/medicationCollectionHandler',
    'app/applets/medication_review/appletHelper',
    'hbs!app/applets/stackedGraph/list/pickListItemTemplate',
    'app/applets/medication_review/charts/stackedGraph',
    'typeahead',
    'highcharts-more',
    'app/applets/lab_results_grid/applet'
], function(Backbone, Marionette, _, $, Highcharts, ChartsCompositeViewTemplate, RowItemView, MedsResource, CollectionHandler, AppletHelper, PickListItemTemplate) {
    "use strict";

    function makeString(object) {
        if (object === null) {
            return '';
        }
        return '' + object;
    }

    function titleize(str) {
        return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
            return c.toUpperCase();
        });
    }

    var ChartsCompositeView = Backbone.Marionette.CompositeView.extend({
        behaviors: {
            QuickTile: {
                childContainerSelector: function() {
                    return this.$el;
                },
                rowTagName: 'div',
                rowAttributes: function() {
                    return {
                        role: 'gridcell'
                    };
                }
            }
        },
        tileOptions: {
            quickLooks: {
                enabled: true
            },
            quickMenu: {
                enabled: true,
                buttons: [{
                    type: 'tilesortbutton',
                    shouldShow: function() {
                        return !_.get(ADK.Messaging.request('get:current:screen'), 'config.predefined');
                    }
                }, {
                    type: 'infobutton'
                }, {
                    type: 'detailsviewbutton'
                }, {
                    type: 'deletestackedgraphbutton',
                    shouldShow: function() {
                        return !_.get(ADK.Messaging.request('get:current:screen'), 'config.predefined') && ADK.UserService.hasPermission('access-stack-graph');
                    }
                }]
            },
            primaryAction: {
                enabled: true
            }
        },
        template: ChartsCompositeViewTemplate,
        childViewContainer: '.collection-container',
        childView: RowItemView,
        events: {
            'reorder': 'reorderRows'
        },
        eventString: function() {
            return [
                'focusin.' + this.cid,
                'click.' + this.cid
            ].join(' ');
        },
        setDocHandler: function() {
            $(document).off(this.eventString());
            $(document).on(this.eventString(), {
                view: this
            }, this.documentHandler);
        },
        documentHandler: function(e) {
            var view = e.data.view;
            if (view.$(e.target).length || view.options.preventFocusoutClose) {
                return;
            }
            $(document).off(view.eventString());
        },
        initialize: function(options) {
            this.instanceId = options.instanceId;
            this.isAdded = options.options.isAdded;
            this.childViewOptions = {
                activeCharts: options.activeCharts,
                timeLineCharts: options.timeLineCharts
            };

            this.stackedGraphModel = new ADK.UIResources.Writeback.StackedGraph.Model();
            this.bindEntityEvents(this.stackedGraphModel, this.stackedGraphModelEvents);
        },
        stackedGraphModelEvents: {
            'create:success': 'success',
            'update:success': 'success'
        },
        success: function(model, response) {
            var newActiveChartIndex = this.childViewOptions.activeCharts.length - (model.reorderObj.newIndex + 1);
            var screenId = ADK.ADKApp.currentScreen.config.id;
            var userDefinedGraphs = response.data.get('userDefinedGraphs');
            var screenObject = _.findWhere(userDefinedGraphs, {
                id: screenId
            });
            if (screenObject) {
                var appletsObject = _.findWhere(screenObject.applets, {
                    instanceId: this.instanceId
                });
                if (_.get(appletsObject, 'graphs')) {
                    ADK.UserDefinedScreens.reorderStackedGraphsInSession(screenId, this.instanceId, appletsObject.graphs);
                }
            }
            // Since the updated graph gets unshifted to position 0, reorder the activeCharts to match.
            var chartToMove = this.childViewOptions.activeCharts.splice(0, 1)[0];
            this.childViewOptions.activeCharts.splice(newActiveChartIndex, 0, chartToMove);
        },
        reorderRows: function(target, reorderObj) {
            if (reorderObj.oldIndex !== reorderObj.newIndex) {
                // Remove the selected model from the collection so that it can be inserted into the new location.
                var temp = this.collection.at(reorderObj.oldIndex);
                this.collection.remove(temp, {
                    removeIndex: reorderObj.oldIndex
                });
                // Add the graph back to the correct location.
                this.collection.add(temp, {
                    at: reorderObj.newIndex,
                    sort: false //this moves the model to new location overriding sort. We reset position for all models to reflect new position next.
                });
                // Update the stackedGraphPosition for each graph to insure future addition/deletions/remove on this session work correctly
                // for simplicity, we iterate over each one and assign them current index
                this.collection.each(function(graph, index) {
                    graph.set('stackedGraphPosition', index, {
                        silent: true
                    });
                });

                var graphs = this.collection.map(function(model) {
                    return {
                        'graphType': model.get('stackedGraphType'),
                        'typeName': model.get('stackedGraphTypeName')
                    };
                });

                this.stackedGraphModel.set('instanceId', this.instanceId);
                this.stackedGraphModel.set('graphs', graphs.reverse());
                this.stackedGraphModel.setIsNew(false);
                this.stackedGraphModel.reorderObj = reorderObj;
                this.stackedGraphModel.save();
            }
        },
        onDestroy: function() {
            this.$el.find('.placeholder-tile-sort').remove();
            $(document).off(this.eventString());
        },
        onShow: function() {
            var self = this;
            this.$el.find('.collection-container').append('<div class="placeholder-tile-sort hidden"></div>');
            this.$el.find('.placeholder-tile-sort').on('dragover', function(e) {
                e.preventDefault();
            });

            this.$el.find('.placeholder-tile-sort').on('drop', function(e) {
                var index = e.originalEvent.dataTransfer.getData('text');
                var originalIndex = Number(index);
                var targetIndex = $(this).index() - 2;
                $(this).addClass('hidden');

                if (originalIndex > targetIndex) {
                    targetIndex++;
                }

                var reorder = {
                    oldIndex: originalIndex,
                    newIndex: targetIndex
                };

                self.reorderRows(e, reorder);
            });

            this.$noGraph = self.$('.no-graph');
            if (!ADK.UserService.hasPermission('access-stack-graph')) {
                return;
            }

            var currentScreen = ADK.Messaging.request('get:current:screen');

            var interval = setInterval(function() {
                if (self.$el.parents('.panel.panel-primary').find('.picklist').find('.typeahead').length > 0) {
                    clearInterval(interval);
                    var theTypeahead = self.$el.parents('.panel.panel-primary').find('.picklist').find('.typeahead');
                    var substringMatcher = function(strs, type) {
                        return function findMatches(q, cb) {
                            var matches, substrRegex;

                            // an array that will be populated with substring matches
                            matches = [];
                            // regex used to determine if a string contains the substring `q`
                            substrRegex = new RegExp(q, 'i');

                            // iterate through the pool of strings and for any string that
                            // contains the substring `q`, add it to the `matches` array
                            $.each(strs, function(i, str) {
                                if (substrRegex.test(str)) {
                                    // the typeahead jQuery plugin expects suggestions to a
                                    // JavaScript object, refer to typeahead docs for more info
                                    var match = {
                                        value: str,
                                        type: type
                                    };
                                    var displayValue = str;
                                    if (str === 'LDL CHOLESTEROL') {
                                        displayValue = 'LDL ' + titleize('CHOLESTEROL');
                                    } else if (str !== 'BMI' && str !== 'HDL') {
                                        displayValue = titleize(str);
                                    }
                                    match.displayValue = displayValue;
                                    match.isAdded = _.indexOf(self.isAdded, (str.toUpperCase() + '-' + type.toUpperCase())) !== -1;

                                    match.predefined = Boolean(currentScreen.config.predefined);
                                    matches.push(match);
                                }
                            });

                            if (matches.length > 0) {
                                self.$el.closest('.panel-primary').find('.dropdown .sr-only[aria-live]').text(matches.length + ' results found for ' + this.query + ' under ' + matches[0].type);
                            }
                            cb(matches);
                        };
                    };

                    var vitalDeferred = $.Deferred();
                    var labDeferred = $.Deferred();
                    var medDeferred = $.Deferred();

                    //Getting the Vitals from the resource pool
                    var vitalFetchOptions = {
                        onSuccess: function(collection) {
                            vitalDeferred.resolve({
                                coll: collection
                            });
                        }
                    };
                    var operationalDataTypeVitals = new ADK.UIResources.Fetch.Vitals.OperationalDataTypeVitals();
                    operationalDataTypeVitals.fetchCollection(vitalFetchOptions);

                    //Getting the Labs from the resource pool
                    var labFetchOptions = {
                        onSuccess: function(collection) {
                            labDeferred.resolve({
                                coll: collection
                            });
                        }
                    };
                    var operationalDataTypeLabs = new ADK.UIResources.Fetch.Labs.OperationalDataTypeLabs();
                    operationalDataTypeLabs.fetchCollection(labFetchOptions);

                    var MedModel = Backbone.Model.extend({
                        parse: AppletHelper.parseMedResponse
                    });
                    var GroupedMedCollection = ADK.UIResources.Fetch.MedicationReview.Collection.extend({
                        model: MedModel
                    });
                    var medGroups = new GroupedMedCollection();
                    self.listenToOnce(medGroups, 'read:success', function(collection) {
                        self.stopListening(medGroups, 'read:error');
                        var groupedCollection = CollectionHandler.resetCollections(collection, false);
                        var groupNames = MedsResource.getMedicationGroupNames(groupedCollection);
                        medDeferred.resolve({
                            coll: groupNames,
                            collection: groupedCollection
                        });
                    });
                    self.listenToOnce(medGroups, 'read:error', function() {
                        self.stopListening(medGroups, 'read:success');
                    });
                    medGroups.performFetch({
                        onSuccess: function(collection) {
                            collection.trigger('read:success', collection);
                        },
                        onError: function(collection) {
                            collection.trigger('read:error');
                        }
                    });


                    var sortFunc = function(a, b) {
                        if (a < b) {
                            return -1;
                        }

                        if (a > b) {
                            return 1;
                        }

                        // a must be equal to b
                        return 0;
                    };

                    $.when(vitalDeferred, labDeferred, medDeferred).done(
                        function(vitalPickListCollection, labPickListCollection, medPickListCollection) {
                            var vitalPickList = vitalPickListCollection.coll.pluck('name');
                            vitalPickList.push('BMI');
                            vitalPickList.sort(sortFunc);

                            var labPickList = labPickListCollection.coll.pluck('name');
                            labPickList.sort(sortFunc);

                            var medPickList = medPickListCollection.coll;
                            medPickList.sort(sortFunc);

                            var emptyItemTemplate = '<div class="left-margin-sm right-margin-sm" aria-live="assertive" aria-atomic="true"> No results found for <strong><%= query %></strong> under';
                            theTypeahead.off();
                            theTypeahead.typeahead({
                                    hint: false,
                                    highlight: true,
                                    minLength: 3
                                }, {
                                    name: 'vitals',
                                    displayKey: 'displayValue',
                                    source: substringMatcher(vitalPickList, 'Vitals'),
                                    templates: {
                                        empty: _.template(emptyItemTemplate + ' Vitals </div>'),
                                        suggestion: PickListItemTemplate
                                    }
                                }, {
                                    name: 'labs',
                                    displayKey: 'displayValue',
                                    source: substringMatcher(labPickList, 'Lab Tests'),
                                    templates: {
                                        empty: _.template(emptyItemTemplate + ' Lab Tests </div>'),
                                        suggestion: PickListItemTemplate
                                    }
                                }, {
                                    name: 'meds',
                                    displayKey: 'displayValue',
                                    source: substringMatcher(medPickList, 'Medications'),
                                    templates: {
                                        empty: _.template(emptyItemTemplate + ' Medications </div>'),
                                        suggestion: PickListItemTemplate
                                    }
                                })
                                .on('typeahead:opened', function() {
                                    var ttDrop = theTypeahead.parents('.twitter-typeahead').find('.tt-dropdown-menu');
                                    if (ttDrop.find('.user-input').length === 0) {
                                        ttDrop.prepend($('<p/>', {
                                            'class': 'user-input',
                                            'text': 'Hello'
                                        }));
                                    }
                                })
                                .on('typeahead:cursorchanged', function(e, suggestion) {
                                    var screenReaderText = (suggestion.isAdded ? 'Delete graph by pressing enter' : 'Add graph by pressing enter');
                                    $(this).closest('.dropdown').find('.sr-only[aria-live]').text(screenReaderText);
                                })
                                .on('typeahead:selected', function(e, suggestion) {
                                    var instanceId = self.instanceId;
                                    var graphType = suggestion.type;
                                    var value = suggestion.value;

                                    if (suggestion.isAdded) {
                                        var model = self.collection.find(function(model) {
                                            return (model.get('stackedGraphTypeName') === value.toUpperCase() && model.get('stackedGraphType') === graphType);
                                        });

                                        if (!_.isUndefined(model)) {
                                            var pickListBtn = $(event.target).closest('.picklist').find('[data-toggle="dropdown"]');
                                            model.set('picklistBtnEl', pickListBtn);
                                            ADK.Messaging.getChannel('stackedGraph').trigger('delete', {
                                                model: model
                                            });
                                        }
                                    } else {
                                        suggestion.isAdded = true;

                                        //new graph always goes first so we give it a value one more than the one at index 0
                                        //when its added, collection will automatically add it at index 0
                                        var position = self.collection.length === 0 ? 0 : self.collection.at(0).get('stackedGraphPosition') - 1;

                                        var params = {
                                            typeName: value,
                                            instanceId: instanceId,
                                            graphType: graphType,
                                            graphPosition: position
                                        };

                                        if (!ADK.ADKApp.currentScreen.config.predefined) {
                                            //Replacing fetch 'POST'
                                            var stackedGraphModel = new ADK.UIResources.Writeback.StackedGraph.Model();
                                            var attributes = {
                                                id: ADK.ADKApp.currentScreen.config.id,
                                                instanceId: instanceId,
                                                graphType: graphType,
                                                typeName: value.toUpperCase()
                                            };
                                            stackedGraphModel.save(attributes);

                                            ADK.UserDefinedScreens.addOneStackedGraphToSession(
                                                ADK.ADKApp.currentScreen.config.id,
                                                instanceId,
                                                graphType,
                                                value.toUpperCase()
                                            );
                                        }

                                        $(this).typeahead('val', '');

                                        var channel;
                                        if (graphType === 'Vitals') {
                                            channel = ADK.Messaging.getChannel('vitals');
                                            channel.request('chartInfo', params);
                                        } else if (graphType === 'Lab Tests') {
                                            channel = ADK.Messaging.getChannel('lab_results_grid');
                                            channel.request('chartInfo', params);
                                        } else if (graphType === 'Medications') {
                                            channel = ADK.Messaging.getChannel('meds_review');
                                            params.collection = medPickListCollection.collection;
                                            channel.request('chartInfo', params);
                                        }
                                    }
                                })
                                .click(function(e) {
                                    e.stopPropagation();
                                })
                                .on('keyup keydown', function(e) {
                                    if (e.keyCode === 32) {
                                        e.stopPropagation();
                                    }
                                })
                                .on('keyup', function() {
                                    var val = $(this).val();
                                    theTypeahead.parents('.twitter-typeahead').find('.tt-dropdown-menu .user-input').text('Search for ' + val);
                                });
                        }
                    );

                    //The dropdown closes everytime the input box looses focus, but hidden.bs.dropdown isn't always triggered, so we're using 'focusout' instead
                    theTypeahead.parents('.dropdown-menu').on('focusout', function(e) {
                        if (_.isEmpty(e.relatedTarget) || !_.isEqual(e.relatedTarget.className, 'tt-dropdown-menu') && e.relatedTarget.className.indexOf('typeahead') === -1) {
                            theTypeahead.typeahead('val', '');
                        }
                    });

                    theTypeahead.parents('.dropdown').on('click', function() {
                        window.requestAnimationFrame(function() {
                            theTypeahead[0].focus();
                        });
                    });
                }
            }, 500);
        }
    });
    return ChartsCompositeView;
});
