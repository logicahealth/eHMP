define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    "api/ErrorMessaging",
    'main/collections/collections',
    'main/ui_views/table/body/groupedBody',
    'main/ui_views/table/body/row',
    'main/ui_views/table/head/row',
    'main/ui_views/table/foot/row'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    ErrorMessaging,
    Collections,
    GroupedBody,
    BodyRow,
    Head,
    Foot
) {
    'use strict';

    var EmptyView = Backbone.Marionette.ItemView.extend({
        _states: [{
            state: 'loading',
            text: 'Loading...',
            type: 'inProgress'
        }, {
            state: 'sorting',
            text: 'Sorting...',
            type: 'inProgress'
        }, {
            state: 'filtering',
            text: 'Filtering...',
            type: 'inProgress'
        }, {
            state: 'empty',
            text: 'No records found',
            type: 'success'
        }, {
            state: 'complete',
            text: 'Complete.',
            type: 'success'
        }, {
            state: 'error',
            text: 'An error has occurred.',
            type: 'error'
        }],
        label: null,
        tagName: 'tr',
        className: 'no-hover-state all-border-no',
        attributes: {
            'aria-live': 'assertive'
        },
        templateHelpers: function() {
            var self = this;
            return {
                getColspan: this.getOption('columns').length,
                getText: function() {
                    var defaultStateText = _.get((_.find(self._states, {
                        state: this.state
                    }) || {}), 'text', false);
                    return _.isString(this.text) && !_.isEqual(defaultStateText, this.text) ? this.text : defaultStateText;
                },
                isInProgress: function() {
                    return _.get(_.find(self._states, {
                        state: this.state
                    }), 'type') === 'inProgress';
                },
                getLabel: this.getOption('label'),
                getMessage: !_.isEmpty(this.model.get('message')) ? this.model.get('message') : 'Response status: ' + this.model.get('status') + ', ' + this.model.get('statusText')
            };
        },
        getTemplate: function() {
            if (_.isEqual(this.model.get("state"), "error")) {
                return Handlebars.compile([
                    '<td colspan="{{getColspan}}" class="has-error-message">',
                    '<div class="table-error-message-container">',
                    '<i class="fa fa-exclamation-circle right-padding-xs color-red font-size-14" aria-hidden="true"></i>',
                    '<div data-flex-width="1"><p>{{#if getLabel}}<span class="sr-only">{{getLabel}}</span> {{/if}}Error loading records.<span> {{getMessage}}.</span>{{#if logId}}<span> For defect reporting: {{logId}}</span>{{/if}}</p></div>',
                    '</div>',
                    '</td>'
                ].join('\n'));
            } else {
                return Handlebars.compile('<td colspan="{{getColspan}}"><span data-table-state="{{state}}">{{#if isInProgress}}<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> {{/if}}{{#if getLabel}}<span class="sr-only">{{getLabel}}</span> {{/if}}{{getText}}</span></td>');
            }
        },
        modelEvents: {
            'change': function(model) {
                if (!_.isEqual(model.get('state'), "error")) {
                    model.set({
                        "message": null,
                        "status": null,
                        "statusText": null,
                        "logId": null
                    }, {
                        silent: true,
                        unset: true
                    });
                } else {
                    this.errorModel.set('message', ErrorMessaging.getMessage(model.get('status')));
                }
                this.render.call(this, arguments);
            }
        },
        initialize: function() {
            this.errorModel = new Backbone.Model({
                message: ErrorMessaging.getMessage(this.model.get('status'))
            });
        },
        behaviors: function() {
            return {
                FlexContainer: {
                    container: '.table-error-message-container',
                    direction: 'row'
                },
                ErrorComponents: {
                    container: 'td.has-error-message',
                    getModel: function() {
                        return this.errorModel;
                    },
                    shouldShow: function() {
                        return _.isEqual(this.model.get('state'), 'error');
                    }
                }
            };
        }
    });

    var Table = Backbone.Marionette.CompositeView.extend({
        label: null,
        tagName: 'table',
        className: 'table table-view',
        template: Handlebars.compile([
            '{{#if label}}<caption class="sr-only">{{label}}</caption>{{/if}}',
            '<thead></thead>',
            '<tbody></tbody>',
            '<tfoot aria-hidden="true"></tfoot>'
        ].join('\n')),
        templateHelpers: function() {
            return {
                'label': this.getOption('label')
            };
        },
        getChildView: function() {
            return this._isGrouped() ? GroupedBody : BodyRow;
        },
        childViewOptions: function(model) {
            var options = {};
            _.extend(options, this.options, {
                idSuffix: this.cid,
                collection: new Backbone.Collection(this.getOption('columns'))
            });
            if (this._isGrouped()) {
                _.extend(options, {
                    collection: model.get('rows'),
                    sortGroup: this.collection.sortGroup
                });
            }
            return options;
        },
        filter: function(child, index, collection) {
            if (!this._isGrouped()) {
                return true;
            }
            return !!_.get(child.get('rows'), 'length');
        },
        childViewContainer: 'tbody',
        collectionEvents: {
            'reset': function(collection, options) {
                this.getChildViewContainer(this).empty();
                this.emptyModel.set('state', _.get(options, 'state', 'loading'));
            },
            'sync': function() {
                this._updateEmptyView();
            },
            'refresh': function() {
                this.stopListening(this.sortModel, 'change', this._onSortModelChange);
                this.sortModel.set(this.sortModel.defaults);
                this.listenTo(this.sortModel, 'change', this._onSortModelChange);
            },
            'error': function(collection, resp) {
                if (resp.statusText === "abort") {
                    return;
                }
                var startIndex = _.get(collection, 'Criteria.Page.start');
                if ((collection.length >= startIndex) && !_.isEqual(_.get(collection, 'Criteria.Page.start'), 0)) {
                    return;
                }
                // might need more/different approach?
                var isClientSideError = _.isEmpty(_.get(resp, 'message')) && _.get(resp, 'status') === 200 && _.isEmpty(_.get(resp, 'statusText'));

                var message = _.get(resp, 'message', isClientSideError ? 'Parse Error' : '');
                var status = _.get(resp, 'status', isClientSideError ? 'client' : null);
                var statusText = _.get(resp, 'statusText', isClientSideError ? 'client-side error' : '');
                var logId = _.get(resp, 'logId', (collection.serverRequestId || ''));

                this.emptyModel.set({
                    'state': 'error',
                    'message': message,
                    'status': status,
                    'statusText': statusText,
                    'logId': logId
                });
            }
        },
        emptyView: EmptyView,
        emptyViewOptions: function() {
            return {
                columns: this.getOption('columns'),
                model: this.emptyModel,
                label: this.getOption('label')
            };
        },
        _updateEmptyView: function() {
            if (this.emptyModel.get('state') === 'error') return;
            if (this.isEmpty() && this._showingEmptyView) {
                this.emptyModel.set('state', 'empty');
            } else {
                this.emptyModel.set('state', 'complete');
            }
        },
        regions: {
            'HeaderRegion': 'thead',
            'FooterRegion': 'tfoot'
        },
        initialize: function() {
            this.options = _.extend({}, this.options, {
                helpers: this.getOption('helpers') || {}
            });
            this._tableRegionManager = new Backbone.Marionette.RegionManager();
            var EmptyModel = Backbone.Model.extend({
                defaults: {
                    state: 'loading'
                }
            });
            this.emptyModel = new EmptyModel();
            // Maybe this should/will be handled by the collection
            var CurrentSortModel = Backbone.Model.extend({
                defaults: {
                    key: null, // maybe should be determined by options passed in?
                    direction: null // determined by options passed in?
                }
            });
            var defaultColumnName = this.getOption('initialSortedColumn');
            if (_.isString(defaultColumnName)) {
                var defaultColumn = _.findWhere(this.getOption('columns'), { name: defaultColumnName });
                if (defaultColumn) {
                    var initialSortState = {
                        key: defaultColumnName,
                        direction: _.get(defaultColumn, 'sortKeys.defaultDirection', 'asc')
                    };
                    CurrentSortModel = CurrentSortModel.extend({
                        defaults: initialSortState,
                        _cycleToDefault: false,
                        _defaultSortColumn: defaultColumnName
                    });
                }
            }
            this.sortModel = new CurrentSortModel();
            this.listenTo(this.sortModel, 'change', this._onSortModelChange);
        },
        onRenderTemplate: function() {
            var HeaderRegion = Backbone.Marionette.Region.extend({
                el: this.$el.children('thead')
            });
            var FooterRegion = Backbone.Marionette.Region.extend({
                el: this.$el.children('tfoot')
            });
            this._tableRegionManager.addRegions({
                'HeaderRegion': HeaderRegion,
                'FooterRegion': FooterRegion
            });

            var headerRegion = this._tableRegionManager.get('HeaderRegion');
            headerRegion.show(new Head(_.extend({}, this.options, {
                idSuffix: this.cid,
                collection: new Backbone.Collection(this.getOption('columns')),
                dataCollection: this.collection,
                sortModel: this.sortModel
            })));

            var footerRegion = this._tableRegionManager.get('FooterRegion');
            footerRegion.show(new Foot(_.extend({}, this.options, {
                colspan: this.getOption('columns').length,
                emptyModel: this.emptyModel,
                label: this.getOption('label')
            })));
        },
        onBeforeDestroy: function() {
            this._tableRegionManager.destroy();
        },
        _isGrouped: function() {
            return this.collection instanceof Collections.GroupingCollection;
        },
        _onSortModelChange: function(model, options) {
            this.emptyModel.set('state', 'sorting');
        }
    });

    var Orig = Table;
    var ModifiedTable = Orig.extend({
        constructor: function() {
            if (!this.options) this.options = {};
            var args = Array.prototype.slice.call(arguments),
                init = this.initialize,
                onRenderTemplate = this.onRenderTemplate,
                onBeforeDestroy = this.onBeforeDestroy;


            var nonExtendableProperties = [];
            _.forIn(Orig.prototype, function(value, key) {
                if (_.startsWith(key, '_')) {
                    nonExtendableProperties.push(key);
                }
            });
            _.extend(this, _.pick(Orig.prototype, nonExtendableProperties));

            this.initialize = function() {
                var args = Array.prototype.slice.call(arguments);
                this.bindEntityEvents(this, this._viewEvents);
                init.apply(this, args);
                if (Orig.prototype.initialize === init) return;
                Orig.prototype.initialize.apply(this, args);
            };

            this.onRenderTemplate = function() {
                var args = Array.prototype.slice.call(arguments);
                Orig.prototype.onRenderTemplate.apply(this, args);
                if (Orig.prototype.onRenderTemplate === onRenderTemplate) return;
                onRenderTemplate.apply(this, args);
            };

            this.onBeforeDestroy = function() {
                var args = Array.prototype.slice.call(arguments);
                Orig.prototype.onBeforeDestroy.apply(this, args);
                if (Orig.prototype.onBeforeDestroy === onBeforeDestroy) return;
                onBeforeDestroy.apply(this, args);
            };

            Orig.prototype.constructor.apply(this, args);
        }
    });

    return ModifiedTable;
});
