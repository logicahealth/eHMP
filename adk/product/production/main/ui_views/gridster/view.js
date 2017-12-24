define([
    'underscore',
    'backbone',
    'api/UserDefinedScreens',
    'main/ui_views/gridster/gridsterItemView',
    'main/ui_views/gridster/gridsterCollection'
], function(_, Backbone, UserDefinedScreens, ItemView, GridsterCollection) {
    'use strict';


    var GridsterModel = Backbone.Model.extend({
        defaults: {
            widget_selector: 'li'
        }
    });


    return Backbone.Marionette.CollectionView.extend({

        _super: Backbone.Marionette.CollectionView.prototype,
        tagName: 'ul',
        childView: ItemView,
        viewModelEvents: {},
        viewModel: new Backbone.Model(),

        gridsterModelEvents: {
            'change:widget_base_dimensions': 'resizeWidgetDimensions'
        },

        childViewOptions: function() {
            return {
                isEditor: this.getOption('isEditor') || false,
                gridsterOptions: this.gridsterOptions,
                gridster: this.getGridsterData(),
                gridsterViewModel: this.viewModel
            };
        },

        initialize: function(options) {
            this.gridsterOptions = _.get(options, 'gridsterOptions', {});
            var applets = UserDefinedScreens.getScreenModuleApplets(ADK.ADKApp.Screens[options.screenId]);
            this.collection = new GridsterCollection(applets);
            this.gridsterModel = new GridsterModel(this.gridsterOptions);
            this.bindEntityEvents(this.gridsterModel, this.gridsterModelEvents);
            this.bindEntityEvents(this.viewModel, this.viewModelEvents);
        },

        onShow: function() {
            this.setGridster();
            var gridster = this.getGridsterData();
            this._gridsterRemoveWidget = gridster.remove_widget.bind(gridster);
            gridster.remove_widget = this._removeWidget.bind(this);
        },

        onBeforeRemoveChild: function(childView) {
            this.getGridsterData().remove_widget(childView.$el);
        },

        onBeforeDestroy: function() {
            this.getGridsterData().remove_widget = null;
            this.getGridsterData().destroy(true);
            this.unbindEntityEvents(this.gridsterModel, this.gridsterModelEvents);
            this.unbindEntityEvents(this.viewModel, this.viewModelEvents);
        },

        /**
         * This is the cruz of why the collection view works.  Instead of attaching the data
         * with jQuery the data is attached through gridster and configured immediately
         */
        attachHtml: function(parent, child, index) {
            if (parent.isBuffering) {
                this._super.attachHtml.apply(this, arguments);
                return;
            }
            var gridData = parent._extractGridsterArguments(_.get(child, 'model'));
            parent.addWidget(gridData, child);
        },

        /**
         * Create a new widget with the given html and add it to the grid
         * @param {Object} options
         * @param {Number} [options.x=1] The number of rows that the widget occupies.
         * @param {Number} [options.y=1] The number of columns that the widget occupies.
         * @param {Array}  [options.max] Max dimensions (Columns, Rows)
         * @param {Array}  [options.min] Min dimensions (Columns, Rows)
         * @param {Number} [options.row] The row the widget should start in
         * @param {Number} [options.col] The column the widget should start in
         * @param {String} [options.html] The string of HTMLElement that represents the widget is going to be added.
         * @param {Marionette.View} childView The child view being added.
         */
        addWidget: function(options, childView) {
            var data = options;
            var elOuterHtml = _.get(childView, 'el.outerHTML');
            if (!_.isUndefined(elOuterHtml)) {
                data = _.extend(options, {
                    html: elOuterHtml
                });
            }
            this.triggerMethod('before:widget:add', data);

            var html = _.get(data, 'html');
            var x = _.get(data, 'x', '1');
            var y = _.get(data, 'y', '1');
            var row = _.get(data, 'row', null);
            var col = _.get(data, 'col', null);
            var max = _.get(data, 'max');
            var min = _.get(data, 'min');


            this.gridster.add_widget(html, x, y, col, row, max, min);
            this.triggerMethod('after:widget:add', childView, data);
        },

        setGridster: function(data) {
            if (data) {
                this.gridsterModel.set(data);
            }
            this.$el.gridster(this.gridsterModel.toJSON());
        },

        getGridsterData: function() {
            return this.$el.data('gridster');
        },

        resizeWidgetDimensions: function(model) {
            this._triggerGridsterHelper('resize_widget_dimensions', model.pick(['widget_base_dimensions']));
        },


        _triggerGridsterHelper: function(helperName, options) {
            this.getGridsterData()[helperName](options);
        },

        /**
         * Helper function to convert the annoying keys in the model to the format
         * that a gridster widget expects them to be in.
         * @param {Backbone.Model} model
         * @return {{x, y, max: [null,null], min: [null,null]}}
         * @private
         */
        _extractGridsterArguments: function(model) {
            return {
                x: model.get('dataSizeX'),
                y: model.get('dataSizeY'),
                max: [model.get('dataMaxSizeX'), model.get('dataMaxSizeY')],
                min: [model.get('dataMinSizeX'), model.get('dataMinSizeY')],
                row: model.get('dataRow'),
                col: model.get('dataCol')
            };
        },

        /**
         * A helper function that removes items from the collection when gridster.remove_widget
         * is called directly
         * @param {jQuery} $el
         * @private
         */
        _onRemoveSyncCollection: function($el) {
            var id = $el.attr('data-instanceid');
            if (id) {
                var childModel = this.collection.get(id);
                if (childModel) {
                    var child = this.children.findByModel(childModel);
                    if (child) {
                        this.removeChildView(child.view);
                    }
                    this.collection.remove(childModel, {
                        silent: true
                    });
                }
            }
        },

        /**
         * Wrapper for gridster.on_remove, to ensure that the collection stays in sync
         * @param {jQuery} $el
         * @return {*}
         * @private
         */
        _removeWidget: function($el) {
            $el = this.$($el);

            if (!$el.length) {
                return;
            }

            this.triggerMethod('before:widget:remove', $el);
            var resp = this._gridsterRemoveWidget($el);
            this.triggerMethod('after:widget:remove', resp);
            this._onRemoveSyncCollection($el);
            return resp;
        }
    });
});