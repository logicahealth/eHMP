define([
    'puppetForm',
    'handlebars'
], function(PuppetForm, Handlebars) {
    'use strict';

    var SearchbarControl = PuppetForm.SearchbarControl = PuppetForm.Control.extend({
        _super: PuppetForm.Control.prototype,
        requiredFields: ['name'],
        defaults: {
            type: "text",
            maxlength: 255,
            extraClasses: [],
            helpMessage: ''
        },
        template: Handlebars.compile('{{ui-form-searchbar placeholder size=size value=value classes=extraClasses title=title}}'),
        events: {
            "change input": "onChange",
            "focus input": "clearInvalid",
            "click .clear-input-btn": "clearInput",
            "keyup input": "clearBtnDisplay"
        },
        ui: {
            input: 'input',
            clearBtn: '.clear-input-btn'
        },
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$el.find("input").val(), this.model);
        },
        clearInput: function() {
            this.ui.input.val('').focus();
            this.ui.clearBtn.hide();
        },
        clearBtnDisplay: function(){
            if(this.ui.input.val()){
                this.ui.clearBtn.show();
            } else {
                this.ui.clearBtn.hide();
                this.ui.input.focus();
            }
        }
    });

    return SearchbarControl;
});