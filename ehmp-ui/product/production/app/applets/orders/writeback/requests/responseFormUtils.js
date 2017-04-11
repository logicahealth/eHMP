define([
], function() {
    'use strict';

    var FormUtils = {
        //====================== DRAFT UTILITY FUNCTIONS ======================
        onDraftSuccessEvent: function(options) {
            //this.hideInProgress();
            this.$el.trigger('tray.reset');
        },
        onDraftReadSuccess: function(options) {
            //this.hideInProgress();
            this.isDraftLoaded = true;
            this.model.trigger('draft:getData');
        }
    };

    return FormUtils;
});
