define([
    'app/applets/orders/writeback/common/buttons/buttonUtils'
], function(ButtonUtils) {
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
        if (_.every(form.requiredFields, function(fieldName) {
            if (form.model.has(fieldName) && !form.model.errorModel.has(fieldName)) {
                if (_.isArray(form.model.get(fieldName))) {
                    return _.some(form.model.get(fieldName), function(element) {
                        return !(_.isEmpty(element));
                    });
                } else {
                    return !(_.isEmpty(form.model.get(fieldName)));
                }
            }

            return false;
        })) {
            ButtonUtils.enable(button);
        } else {
            ButtonUtils.disable(button);
        }

        if (!_.isEmpty(form.model.errorModel.attributes)) {
            ButtonUtils.disable(button);
        }
    };

    return {
        addRequiredField: addRequiredField,
        requireFields: requireFields,
        validateRequiredFields: validateRequiredFields,
        makeButtonDependOnRequiredFields: makeButtonDependOnRequiredFields
    };
});
