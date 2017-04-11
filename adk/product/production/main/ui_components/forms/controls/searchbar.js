define([
    'puppetForm',
    'handlebars'
], function(PuppetForm, Handlebars) {
    'use strict';

    var SearchbarPrototype = {
        requiredFields: ['name'],
        defaults: {
            type: "text",
            maxlength: 255,
            extraClasses: [],
            helpMessage: '',
            minimumInputLength: 1
        },
        template: Handlebars.compile('{{ui-form-searchbar placeholder size=size value=value classes=extraClasses title=title}}'),
        events: {
            "change input": "onChange",
            "focus input": "clearInvalid",
            "click .clear-input-btn": "clearInput",
            "keyup input": function() {
                this.clearBtnDisplay();
                this.searchBtnEnable();
            }
        },
        ui: {
            input: 'input',
            clearBtn: '.clear-input-btn',
            searchBtn: '.input-group-btn > button'
        },
        onAttach: function() {
            this.ui.searchBtn.prop('disabled', true);
        },
        getValueFromDOM: function() {
            return this.formatter.toRaw(this.$el.find("input").val(), this.model);
        },
        clearInput: function() {
            this.ui.input.val('').focus();
            this.ui.clearBtn.hide();
            this.ui.searchBtn.prop('disabled', true);
        },
        clearBtnDisplay: function(){
            if(this.ui.input.val()){
                this.ui.clearBtn.show();
            } else {
                this.ui.clearBtn.hide();
                this.ui.input.focus();
            }
        },
        searchBtnEnable: function() {
            if (this.ui.input.val().length >= this.field.get('minimumInputLength')) {
                this.ui.searchBtn.prop('disabled', false);
            } else {
                this.ui.searchBtn.prop('disabled', true);
            }
        }
    };

    var Searchbar = PuppetForm.SearchbarControl = PuppetForm.Control.extend(
        _.defaults(SearchbarPrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return Searchbar;
});