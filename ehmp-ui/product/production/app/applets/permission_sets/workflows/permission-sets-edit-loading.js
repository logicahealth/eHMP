define([
    'underscore',
    'app/applets/permission_sets/workflows/permission-sets-fetch-failure',
    'hbs!app/applets/permission_sets/templates/create-loading-view'
], function(_, warningOptions, template) {
    'use strict';

    var STEP_SIZE = 10;
    var requestAnimationFrame = requestAnimationFrame || _.partialRight(setTimeout, 0);


    /**
     * Permission Sets Edit Loading View
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return ADK.UI.Form.extend({

        fields: [{
            control: 'container',
            extraClasses: ['modal-body', 'all-padding-md'],
            items: [{
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'container',
                    extraClasses: 'col-xs-12',
                    template: template
                }]
            }]
        }, {
            control: 'container',
            extraClasses: 'modal-footer'
        }],

        onInitialize: function onInitialize() {
            this.isFetched = false;
            this.isAttached = false;

            this.listenToOnce(this.versions, 'fetch:success', this.fetchSuccess);
            this.listenToOnce(this.categories, 'fetch:success', this.fetchSuccess);

            this.listenToOnce(this.versions, 'fetch:error', this.fetchError);
            this.listenToOnce(this.categories, 'fetch:error', this.fetchError);
        },

        onBeforeShow: function onBeforeShow() {
            this.versions.fetchCollection();
            this.categories.fetchCollection();
        },

        /**
         * If the view is attached and both collections have returned, start loading multi selects.
         */
        fetchSuccess: function fetchSuccess() {
            if (this.versions.length && this.categories.length) {
                this.isFetched = true;
                if (this.isAttached) {
                    this.fillCollections();
                }
            }
        },

        fetchError: function fetchError() {
            var warning = new ADK.UI.Alert(warningOptions);
            warning.show();

            var footer = _.get(warning, 'FooterRegion.currentView');

            this.listenToOnce(footer, 'fetch:aborted:confirm', function() {
                ADK.UI.Workflow.hide();
            });
        },

        /**
         * Ensures that request animation frame is called in `this` scope
         * @param func
         */
        requestAnimationFrame: function animate(func) {
            return requestAnimationFrame(_.bind(func, this));
        },

        /**
         * Fills the permissions collections while the loading indicator is up.
         * This helps things look less choppy on load.
         */
        fillCollections: function fillCollections() {
            this.fill(this._permissions.toPicklistArray(this.model.get('permissions')), this.permissions, function() {
                this.permissions.trigger('change');
                this.workflow.goToNext();
            });
        },

        /**
         * Recursive non blocking function to fill the multi selects without freezing the DOM.
         *
         * No need to worry about maximum call stack exceeded here, because the recursion creates new animation frames
         * which reset the call stack.
         *
         * @param {*} data Raw data array
         * @param {Collection} collection The collection to insert the data into
         * @param {Function} callback
         */
        fill: function fill(data, collection, callback) {
            this.requestAnimationFrame(function fillMultiSelects() {
                var arr = data.splice(0, STEP_SIZE);
                collection.add(arr);
                if (data.length) {
                    return this.fill(data, collection, callback);
                }
                return callback.apply(this);
            });
        },

        /**
         * If the view is attached and both collections have returned, start loading multi selects.
         */
        onAttach: function onAttach() {
            this.isAttached = true;
            if (this.isFetched) {
                this.fillCollections();
            }
        }
    });
});