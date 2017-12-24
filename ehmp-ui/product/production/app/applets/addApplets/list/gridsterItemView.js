define([
    'backbone',
    'app/applets/addApplets/list/switchboardLayoutView'
], function(Backbone, SwitchBoard) {
    'use strict';

    var GridsterView = ADK.Views.GridsterView;
    var ChildView = GridsterView.prototype.childView;

    var SWITCHBOARD_REMOVE = 'removeApplet';
    var DEFAULT_EXPANDED_SIZE = {dataSizeX: 8, dataSizeY: 6};
    var DEFAULT_GIST_SIZE = {dataSizeX: 4, dataSizeY: 3};
    var DEFAULT_SIZE = {dataSizeX: 4, dataSizeY: 4};

    /**
     * A lot of this is a work around to get gridster to work with marionette.
     * Though, I am not happy with a lot of things that I have done, because most of them are hacks
     * to make these view compatible with gridster.  This solution is preferable to the way it was
     * before where everything was manually handled with jQuery.
     *
     * Ideally, the ADK components will one day change eliminating the need for a lot of these hacks.
     *
     * Until than, this will do.
     */
    return ChildView.extend({
        ui: {
            cog: '.applet-options-button'
        },

        events: {
            'click @ui.cog': 'displaySwitchBoard'
        },

        /**
         * Creates a switchboard inside of the item view replacing elements, hence the need to re-render when done.
         */
        displaySwitchBoard: function(event) {
            var isClosable = !!(event);
            this.undelegateEvents();
            this.options.gridsterViewModel.set('isSwitchBoardOpen', true);
            this.$el.empty();
            var region = this._getSwitchBoardRegion();
            region.show(new SwitchBoard({
                model: this.model,
                region: region,
                parent: this,
                isCloseable: isClosable
            }));
        },

        onBeforeDestroy: function() {
            var region = this._getSwitchBoardRegion();
            if (region) {
                region.empty();
            }
        },

        /**
         * Called when a button is pressed on the switchboard.
         * @param {String} buttonType The view type [gist, summary, expanded] or 'removeApplet'
         */
        onSwitchBoardSelect: function(buttonType) {
            this.delegateEvents();
            this.regionManager.emptyRegions();
            if (buttonType !== SWITCHBOARD_REMOVE) {
                var data = this._getSize(buttonType);
                data.viewType = buttonType;
                this.model.set(data);
                this.render();
            }
            this.options.gridsterViewModel.set('isSwitchBoardOpen', false);
        },

        /**
         * This is a hack to force the force to make the switchboard ADK compatible.
         * Ideally, in the future the ADK portion can be rewritten so this is not needed.
         * @private
         */
        _getSwitchBoardRegion: function() {
            if (!this.regionManager) {
                this.regionManager = new Backbone.Marionette.RegionManager();
                this.regionManager.addRegion('switchBoard', this);
            }
            return this.regionManager.get('switchBoard');
        },

        /**
         * Helper function to set applets to the correct size
         * @param viewType
         * @return {{dataSizeX: number, dataSizeY: number}}
         * @private
         */
        _getSize: function(viewType) {
            if (viewType === 'expanded') {
                return DEFAULT_EXPANDED_SIZE;
            } else if (viewType === 'gist') {
                return DEFAULT_GIST_SIZE;
            }
            return DEFAULT_SIZE;
        }
    });
});