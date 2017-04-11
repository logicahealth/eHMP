define([
    'backbone',
    'marionette',
    'underscore',
    'highcharts',
    'hbs!app/applets/stackedGraph/list/chartsCompositeViewTemplate',
    'app/applets/stackedGraph/utils/utils',
    'app/applets/stackedGraph/list/rowItemView',
    'app/applets/medication_review_v2/medicationResourceHandler',
    'app/applets/medication_review_v2/medicationCollectionHandler',
    'app/applets/medication_review_v2/charts/stackedGraph',
    'typeahead',
    'highcharts-more',
    'app/applets/lab_results_grid/applet'
], function(Backbone, Marionette, _, Highcharts, ChartsCompositeViewTemplate, Utils, RowItemView, MedsResource, CollectionHandler) {
    "use strict";

    function makeString(object) {
        if (object === null) {
            return '';
        }
        return '' + object;
    }

    function capitalize(str, lowercaseRest) {
        str = makeString(str);
        var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

        return str.charAt(0).toUpperCase() + remainingChars;
    }

    function titleize(str) {
        return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
            return c.toUpperCase();
        });
    }

    var ChartsCompositeView = Backbone.Marionette.CompositeView.extend({
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
        childEvents: {
            'toggle:quicklook': function(e) {
                var el = e.ui.popoverEl;
                this.setDocHandler();
                ADK.Messaging.getChannel('gists').trigger('close:quicklooks', el);
                el.popup('toggle');
            }
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
            ADK.Messaging.getChannel('gists').trigger('close:quicklooks');
            $(document).off(view.eventString());
        },
        initialize: function(options) {
            this.instanceId = options.instanceId;
            this.isAdded = options.options.isAdded;
            this.childViewOptions = {
                activeCharts: options.activeCharts,
                timeLineCharts: options.timeLineCharts
            };

            this.listenTo(ADK.Messaging.getChannel('gists'), 'close:quicklooks', function(el) {
                this.$('[data-toggle=popover]').not(el).popup('hide');
            });
        },
        reorderRows: function(target, reorderObj) {
            var self = this;
            if (reorderObj.oldIndex !== reorderObj.newIndex) {
                // Remove the selected model from the collection so that i can be inserted into the new location.
                var temp = this.collection.at(reorderObj.oldIndex);
                this.collection.remove(temp, {removeIndex: reorderObj.oldIndex});
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
                var model = Utils.buildUpdateModel(ADK.ADKApp.currentScreen.config.id, self.instanceId, self.collection);
                model.reorderObj = reorderObj;
                model.save(null, {
                    success: function(model, response) {
                        var newActiveChartIndex = self.childViewOptions.activeCharts.length - (model.reorderObj.newIndex+1);
                        var screenId = ADK.ADKApp.currentScreen.config.id;
                        var screenObject = _.findWhere(response.data.userDefinedGraphs, {
                            id: screenId
                        });
                        if (screenObject) {
                            var appletsObject = _.findWhere(screenObject.applets, {
                                instanceId: self.instanceId
                            });
                            if (appletsObject && appletsObject.graphs) {
                                ADK.UserDefinedScreens.reorderStackedGraphsInSession(screenId, self.instanceId, appletsObject.graphs);
                            }
                        }
                        // Since the updated graph gets unshifted to position 0, reorder the activeCharts to match.
                        self.childViewOptions.activeCharts.splice(newActiveChartIndex, 0, self.childViewOptions.activeCharts.splice(0,1)[0]);
                    },
                    error: function(model) {}
                });
            }
        },
        hidePopovers: function(e) {
            this.$('[data-toggle=popover]').popup('hide');
            ADK.Messaging.getChannel('gists').trigger('close:quicklooks');
        },
        onDestroy: function() {
            $(this.el).find('.placeholder-tile-sort').remove();
            $(document).off(this.eventString());
        },
        onShow: function() {
            var self = this;
            $(this.el).find('.collection-container').append('<div class="placeholder-tile-sort hidden"></div>');
            $(this.el).find('.placeholder-tile-sort').on('dragover', function(e) {
                e.preventDefault();
            });

            $(this.el).find('.placeholder-tile-sort').on('drop', function(e) {
                var index = e.originalEvent.dataTransfer.getData('text');
                var originalIndex = Number(index);
                var targetIndex = $(this).index() - 2;
                $(this).addClass('hidden');

                if (originalIndex > targetIndex)
                    targetIndex++;

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
                                        // displayKey: capitalize(str)
                                    };
                                    var displayValue = str;
                                    if (str === 'LDL CHOLESTEROL') {
                                        displayValue = 'LDL ' + titleize('CHOLESTEROL');
                                    } else if (str !== 'BMI' && str !== 'HDL') {
                                        displayValue = titleize(str);
                                    }
                                    match.displayValue = displayValue;
                                    if (_.indexOf(self.isAdded, (str.toUpperCase() + '-' + type.toUpperCase())) === -1) {
                                        match.isAdded = false;
                                    } else {
                                        match.isAdded = true;
                                    }

                                    if (!currentScreen.config.predefined) {
                                        match.predefined = false;
                                    } else if (currentScreen.config.predefined) {
                                        match.predefined = true;
                                    }
                                    matches.push(match);
                                }
                            });

                            if (matches.length > 0) {
                                $(self.$el).closest('.panel-primary').find('.dropdown .sr-only[aria-live]').text(matches.length + ' results found for ' + this.query + ' under ' + matches[0].type);
                            }
                            cb(matches);
                        };
                    };

                    var vitalDeferred = $.Deferred();
                    var labDeferred = $.Deferred();
                    var medDeferred = $.Deferred();

                    var vitalFetchOptions = {
                        resourceTitle: 'operational-data-type-vital',
                        onSuccess: function(collection) {
                            vitalDeferred.resolve({
                                coll: collection
                            });
                        }
                    };

                    ADK.ResourceService.fetchCollection(vitalFetchOptions);

                    var labFetchOptions = {
                        resourceTitle: 'operational-data-type-laboratory',
                        onSuccess: function(collection) {
                            labDeferred.resolve({
                                coll: collection
                            });
                        }
                    };

                    ADK.ResourceService.fetchCollection(labFetchOptions);

                    var medFetchOptions = {
                        resourceTitle: 'operational-data-type-medication',
                        onSuccess: function(collection) {
                            medDeferred.resolve({
                                coll: collection
                            });
                        }
                    };
                    CollectionHandler.fetchAllMeds(false, function(collection) {
                        var groupNames = MedsResource.getMedicationGroupNames(collection);
                        medDeferred.resolve({
                            coll: groupNames,
                            collection: collection
                        });
                    });

                    // ADK.ResourceService.fetchCollection(medFetchOptions);

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
                            //self._base.render.apply(self, arguments);
                            var vitalPickList = vitalPickListCollection.coll.pluck('name');
                            vitalPickList.push('BMI');
                            vitalPickList.sort(sortFunc);

                            var labPickList = labPickListCollection.coll.pluck('name');
                            labPickList.sort(sortFunc);

                            var medPickList = [];
                            medPickList = medPickListCollection.coll;
                            medPickList.sort(sortFunc);

                            var pickListItemTemplate = '<% if(isAdded && predefined){ %><% } '+
                                                        'else if((!isAdded && !predefined)  || (!isAdded && predefined)) { %>'+
                                                            '<p><%= displayValue %> <i><%= type %></i> <span class="small pull-right"><i class="fa fa-plus"></i> Add</span></p><% } '+
                                                        'else if(isAdded && !predefined) { %>'+
                                                            '<p><%= displayValue %> <i><%= type %></i> <span class="small pull-right"><i class="fa fa-minus"></i> Delete</span></p><% } %>';
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
                                    suggestion: _.template(pickListItemTemplate),
                                    empty: _.template(emptyItemTemplate + ' Vitals </div>')
                                }
                            }, {
                                name: 'labs',
                                displayKey: 'displayValue',
                                source: substringMatcher(labPickList, 'Lab Tests'),
                                templates: {
                                    suggestion: _.template(pickListItemTemplate),
                                    empty: _.template(emptyItemTemplate + ' Lab Tests </div>')
                                }
                            }, {
                                name: 'meds',
                                displayKey: 'displayValue',
                                source: substringMatcher(medPickList, 'Medications'),
                                templates: {
                                    suggestion: _.template(pickListItemTemplate),
                                    empty: _.template(emptyItemTemplate + ' Medications </div>')
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
                                .on('typeahead:selected', function(e, suggestion, dataset) {

                                    if (suggestion.isAdded) {

                                        var model = self.collection.find(function(model) {
                                            return (model.get('stackedGraphTypeName') === suggestion.value.toUpperCase() && model.get('stackedGraphType') === suggestion.type);
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
                                            typeName: suggestion.value,
                                            instanceId: self.instanceId,
                                            graphType: suggestion.type,
                                            graphPosition: position
                                        };

                                        if (!ADK.ADKApp.currentScreen.config.predefined) {
                                            var pickListPersistanceFetchOptions = {
                                                resourceTitle: 'user-defined-stack',
                                                fetchType: 'POST',
                                                criteria: {
                                                    id: ADK.ADKApp.currentScreen.config.id,
                                                    instanceId: self.instanceId,
                                                    graphType: suggestion.type,
                                                    typeName: suggestion.value.toUpperCase()
                                                }
                                            };


                                            ADK.ResourceService.fetchCollection(pickListPersistanceFetchOptions);

                                            ADK.UserDefinedScreens.addOneStackedGraphToSession(
                                                ADK.ADKApp.currentScreen.config.id,
                                                self.instanceId,
                                                suggestion.type,
                                                suggestion.value.toUpperCase());

                                        }

                                        $(this).typeahead('val', '');

                                        var channel, deferredResponse;
                                        if (suggestion.type === 'Vitals') {
                                            channel = ADK.Messaging.getChannel('vitals');
                                            deferredResponse = channel.request('chartInfo', params);
                                        } else if (suggestion.type === 'Lab Tests') {
                                            channel = ADK.Messaging.getChannel('lab_results_grid');
                                            deferredResponse = channel.request('chartInfo', params);
                                        } else if (suggestion.type === 'Medications') {
                                            channel = ADK.Messaging.getChannel('meds_review');
                                            params.collection = medPickListCollection.collection;
                                            deferredResponse = channel.request('chartInfo', params);
                                        }
                                        //end of else
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
                                .on('keyup', function(e) {
                                    var val = $(this).val();
                                    theTypeahead.parents('.twitter-typeahead').find('.tt-dropdown-menu .user-input').text('Search for ' + val);
                                });
                        });

                    //The dropdown closes everytime the input box looses focus, but hidden.bs.dropdown isn't always triggered, so we're using 'focusout' instead
                    theTypeahead.parents('.dropdown-menu').on('focusout', function() {
                        theTypeahead.typeahead('val', '');
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