define([
    'main/ui_components/form/classDefinitions',
    'handlebars',
    'underscore'
], function(
    ClassDefinitions,
    Handlebars,
    _
) {
    'use strict';

    Handlebars.registerHelper("form-class-name", function(methodString) {
        return ClassDefinitions[methodString];
    });

    Handlebars.registerHelper("has-form-class", function(methodString) {
        var prop = ClassDefinitions[methodString] || "";
        return (prop !== "" ? true : false);
    });

    Handlebars.registerHelper("formatter-from-raw", function(formatter, value) {
        return formatter.fromRaw(value);
    });
    Handlebars.registerHelper("clean-for-id", function replaceSpaces(string) {
        if (_.isString(string)){
            string = string || "";
            return string.replace(/[^A-Z0-9]+/ig, "-");
        }
        return string;
    });
    Handlebars.registerHelper("add-required-indicator", function appendIndicator(string, required) {
        if (required && _.isString(string)){
            return string + ' *';
        }
        return string;
    });
    Handlebars.registerHelper("is-sr-only-label", function srOnlyLabel(bool) {
        return (bool ? 'sr-only' : '');
    });
    Handlebars.registerHelper("not", function not(bool) {
        return (_.isUndefined(bool) ? undefined : !bool);
    });
    Handlebars.registerHelper("include", function(list, value, options) {
        if (_.isString(list)) {
            return (list === value) ? options.fn(this) : options.inverse(this);
        }

        if (_.includes(list, value)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    var UI_Form_Helpers = {
        label: function(labelText, options) {
            options = options.hash || {};
            var hbEscape = Handlebars.Utils.escapeExpression;

            var forID, srOnlyLabel, extraClasses, content, extraClassLogic, classString;
            forID = options.forID || "";
            srOnlyLabel = (_.isBoolean(options.srOnlyLabel) ? options.srOnlyLabel : false);
            extraClasses = (_.isArray(options.classes) ? hbEscape(options.classes.toString().replace(/,/g, ' ')) : hbEscape(options.classes || ""));
            content = options.content || "";
            extraClassLogic = options.extraClassLogic || '';
            classString = extraClassLogic + extraClasses + (ClassDefinitions.controlLabelClassName || "");
            classString = _.isEmpty(classString) ? '' : ' class="'+classString+'"';

            var htmlString = [
                '<label for="' + forID + '"' + classString + '>',
                (content ? content +'\n' : '') +
                (srOnlyLabel ? '<span class="sr-only">' + labelText + '</span>': labelText),
                '</label>'
            ].join("\n");

            return new Handlebars.SafeString(htmlString);
        },
        checkbox: function(labelText, options) {
            options = options.hash || {};
            var hbEscape = Handlebars.Utils.escapeExpression;

            var id, title, extraClasses, checked, name, disabled, srOnlyLabel, labelTemplate;
            name = hbEscape(options.name || "checkbox");
            labelTemplate = options.labelTemplate || false;
            labelText = (labelTemplate ? labelText || hbEscape(name) : hbEscape(labelText || name));
            id = hbEscape(options.id || "checkbox-" + labelText.replace(/[^A-Z0-9]+/ig, "-"));
            title = hbEscape(options.title || "Press spacebar to select.");
            extraClasses = (_.isArray(options.classes) ? hbEscape(options.classes.toString().replace(/,/g, ' ')) : hbEscape(options.classes || ""));
            checked = (_.isBoolean(options.checked) ? options.checked : false);
            disabled = (_.isBoolean(options.disabled) ? options.disabled : false);
            srOnlyLabel = (_.isBoolean(options.srOnlyLabel) ? options.srOnlyLabel : false);


            var labelOptions = {
                hash: {
                    forID: id,
                    srOnlyLabel: srOnlyLabel,
                    classes: (disabled ? 'disabled' : ''),
                    content: [
                        '<input type="checkbox"' +
                        ' id="' + id + '" name="' + name + '" title="' + title + '"' +
                        (checked ? ' checked="checked"' : '') +
                        (disabled ? ' disabled' : '') +
                        ' />'
                    ].join("\n")
                }
            };

            var htmlString = [
                '<div class="checkbox' +
                (extraClasses ? ' ' + extraClasses + '"' : '"') +
                '>',
                Handlebars.helpers['ui-form-label'].apply(this, [labelText, labelOptions]),
                '</div>'
            ].join("\n");

            return new Handlebars.SafeString(htmlString);
        },
        searchbar: function(placeholderText, options) {
            // placeholder
            // size (bootstrap col width, default: 12)
            // standAloneForm (default false)
            var root = options.data.root;
            options = options.hash || {};
            var hbEscape = Handlebars.Utils.escapeExpression;

            var title, value, helpMessage, size, id, extraClasses, standAloneForm, required, disabled, errorMessageClass, buttonOptions, icon;
            placeholderText = hbEscape(placeholderText || "");
            title = hbEscape(options.title || placeholderText);
            value = options.value || "";
            helpMessage = options.helpMessage || "";
            size = hbEscape(parseInt(options.size) || 12);
            id = hbEscape(root.id || options.id || "defaultResponsiveSearchBar");
            extraClasses = (_.isArray(options.classes) ? hbEscape(options.classes.toString().replace(/,/g, ' ')) : hbEscape(options.classes || ""));
            standAloneForm = options.standAloneForm || false;
            required = (_.isBoolean(options.required) ? options.required : false);
            disabled = (_.isBoolean(options.disabled) ? options.disabled : false);
            icon = (_.isString(options.icon) ? options.icon : false);
            errorMessageClass = ClassDefinitions.helpMessageClassName ? ' class="'+ClassDefinitions.helpMessageClassName+'"' : '';
            buttonOptions = _.extend({
                type: 'button',
                title: 'Press enter to search, then view results below',
                id: id + 'Btn',
                srOnlyLabel: true,
                icon: 'fa-search',
                extraClasses: "",
                label: 'search',
                hidden: false
            },options.buttonOptions, {
                size: size,
                disabled: disabled
            });
            buttonOptions.extraClasses = (_.isArray(buttonOptions.extraClasses) ? hbEscape(buttonOptions.extraClasses.toString().replace(/,/g, ' ')) : hbEscape(buttonOptions.extraClasses || ""));
            buttonOptions.classes = buttonOptions.extraClasses + ' box-shadow-no text-search btn btn-primary btn-sm';
            var showSubmit = _.isBoolean(buttonOptions.hidden) ? !buttonOptions.hidden : true;
            var showClearButton = _.isString(value) && !_.isEmpty(value);
            buttonOptions = {
                hash: buttonOptions
            };

            var labelOptions = {
                hash: {
                    forID: id,
                    classes: ["sr-only"]
                }
            };

            var htmlString = [
                (standAloneForm ? '<form action="#" method="post">' : ''),
                '<div class="row"><div class="col-xs-' + size + ' ' + extraClasses + '">',
                '<div class="input-group'+(showSubmit ? '': ' submit-hidden')+'">',
                Handlebars.helpers['ui-form-label'].apply(this, [(placeholderText.length > 0 ? placeholderText : title.length > 0 ? title : 'Search'), labelOptions]),

                (icon ?
                '<div class="input-icon--left" aria-hidden="true">' +
                '<i class="fa '+ icon + '"></i>'+
                '</div>' : ''),


                '<input type="text" class="form-control" autocomplete="off" placeholder="' + placeholderText + '" title="' + title + '" ' +
                (disabled ? ' disabled' : '') +
                (required ? ' required' : '') +
                ' id="' + id + '" value="' + value + '" />',
                (showSubmit ? '<div class="input-group-addon">': ''),
                Handlebars.helpers['ui-button'].apply(this, ['Clear', {
                    hash: {
                        classes: 'clear-input-btn btn-icon btn-sm color-grey-darkest' + (showClearButton ? '' : ' hidden'),
                        title: 'Press enter to clear search text',
                        icon: 'fa fa-times',
                        srOnlyLabel: true
                    }
                }]),
                (showSubmit ? Handlebars.helpers['ui-button'].apply(this, [buttonOptions.hash.label, buttonOptions]) :
                    Handlebars.helpers['ui-button'].apply(this, [buttonOptions.hash.label, _.set(buttonOptions, 'hash.classes', buttonOptions.hash.classes + ' sr-only')])),
                (showSubmit ? '</div>' : ''),
                '</div>',
                (_.isEmpty(helpMessage) ? '' : '<span' + errorMessageClass +'>'+ helpMessage + '</span>'),
                '</div>',
                '</div>', (standAloneForm ? '</form>' : '')
            ].join("\n");

            return new Handlebars.SafeString(htmlString);
        }
    };

    return UI_Form_Helpers;
});