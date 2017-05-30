define([
    'handlebars',
    'main/ui_components/form/controls/_input'
], function(
    Handlebars,
    BaseInputControl
) {
    'use strict';

    return BaseInputControl.extend({
        requiredFields: ['name'],
        defaults: {
            type: "text",
            maxlength: 255,
            extraClasses: [],
            helpMessage: '',
            minimumInputLength: 1,
            buttonOptions: {}
        },
        template: Handlebars.compile('{{ui-form-searchbar placeholder size=size value=value title=title helpMessage=helpMessage required=required buttonOptions=buttonOptions id=name icon=icon}}'),
        events: _.defaults({
            "focus input": "clearInvalid",
            "click .clear-input-btn": "clearInput",
            "keyup input": function() {
                this.clearBtnDisplay();
                this.searchBtnEnable();
            }
        }, BaseInputControl.prototype.events),
        ui: {
            input: 'input',
            clearBtn: '.clear-input-btn',
            searchBtn: 'button:last-of-type'
        },
        onBeforeShow: function() {
            this.searchBtnEnable();
        },
        clearInput: function() {
            this.ui.input.val('').trigger('change').focus();
            this.ui.clearBtn.addClass('hidden');
            this.searchBtnEnable();
        },
        clearBtnDisplay: function(){
            if(this.ui.input.val()){
                this.ui.clearBtn.removeClass('hidden');
            } else {
                this.ui.clearBtn.addClass('hidden');
                this.ui.input.focus();
            }
        },
        searchBtnEnable: function() {
            var minInputLength = this.field.get('minimumInputLength');
            if (this.ui.input.val().length >= (_.isUndefined(minInputLength) ? this.defaults.minimumInputLength : minInputLength)) {
                this.ui.searchBtn.prop('disabled', false);
            } else {
                this.ui.searchBtn.prop('disabled', true);
            }
        },
        className: function() {
            return BaseInputControl.prototype.className() + ' form-group--searchbar';
        }
    });
});