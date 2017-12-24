define([
    'underscore',
    'app/applets/orders/writeback/common/buttons/buttonUtils'
], function(_, ButtonUtils) {
    'use strict';

    var addRequiredField = function(form, fieldName) {
        if (_.isString(fieldName)) {
            form.requiredFields.push(fieldName);
        }
    };

    var requireFields = function(form, additional) {
        form.requiredFields = _.clone(form.basicRequiredFields);

        if (additional) {
            if (_.isString(additional)) {
                addRequiredField(form, additional);
            } else if (_.isArray(additional) && (additional.length > 0)) {
                _.each(additional, addRequiredField.bind(null, form));
            }
        }
    };

    var validateRequiredFields = function(form) {
        var success = true;
        _.each(form.requiredFields, function(fieldName) {
            if (_.isEmpty(form.model.get(fieldName))) {
                success = false;
                form.model.errorModel.set(fieldName, 'Required');
            }
        });
        return success;
    };

    var makeButtonDependOnRequiredFields = function(form, button) {
        var formModel = _.get(form, 'model');
        var requiredFields = _.get(form, 'requiredFields');
        var errorModel = _.get(form, 'model.errorModel');
        var errorModelAttributes = _.get(errorModel, 'attributes');
        var validRequiredFields = isValidRequiredFields(requiredFields, formModel, errorModel);

        if (validRequiredFields) {
            ButtonUtils.enable(button);
        } else {
            ButtonUtils.disable(button);
        }

        if (!_.result(formModel, 'isValid') || !_.isEmpty(errorModelAttributes)) {
            ButtonUtils.disable(button);
        }
    };

    var isValidRequiredFields = function(requiredFields, formModel, errorModel) {
        var valid = false;
        if (formModel && errorModel) {
            valid = _.every(requiredFields, function(fieldName) {
                if (formModel.has(fieldName) && !errorModel.has(fieldName)) {
                    return isValidFormField(formModel, fieldName);
                }
                return false;
            });
        }

        return valid;
    };

    var isValidFormField = function(formModel, fieldName) {
        var field = formModel.get(fieldName);
        var isValid = false;
        if (_.isArray(field)) {
            isValid = _.some(field, function(element) {
                return !(_.isEmpty(element));
            });
        } else {
            isValid = !(_.isEmpty(field));
        }

        return isValid;
    };

    return {
        addRequiredField: addRequiredField,
        requireFields: requireFields,
        validateRequiredFields: validateRequiredFields,
        makeButtonDependOnRequiredFields: makeButtonDependOnRequiredFields
    };
});