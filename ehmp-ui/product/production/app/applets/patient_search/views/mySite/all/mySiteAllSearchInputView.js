define([
    "backbone",
    "marionette",
    "hbs!app/applets/patient_search/templates/mySite/all/mySiteAllSearchInputTemplate"
], function(Backbone, Marionette, mySiteAllSearchInputTemplate) {
    "use strict";

    var ENTER_KEY = 13; // find a home for these

    var MySiteAllSearchInputView = Backbone.Marionette.ItemView.extend({
        template: mySiteAllSearchInputTemplate,
        events: {
            'change #patientSearchInput': 'updateSearchString',
            'keydown #patientSearchInput': 'updateSearchString'
        },
        onRender: function() {
            $(this.el).find(".input-group").focusin(function() {
                $(this).addClass("hasFocus");
            }).focusout(function() {
                $(this).removeClass("hasFocus");
            });
        },
        updateSearchString: function(event) {
            var instructions = this.$el.find('.instructions');
            var patientSearchText = this.$el.find(event.currentTarget).val();

            if (!instructions.hasClass('hidden') && patientSearchText.length >= 3){
                instructions.addClass('hidden');
            }
            if (event.keyCode !== undefined && event.keyCode != ENTER_KEY) {
                return;
            }

            patientSearchText = patientSearchText.trim();

            if (patientSearchText.length >= 3) {
                this.model.set({
                    'searchString': patientSearchText
                });
            } else {
                instructions.removeClass('hidden');
                instructions.html('<i class="fa fa-info-circle"></i> Search string must contain at least 3 characters');
            }
        }
    });

    return MySiteAllSearchInputView;
});
