define([], function() {
    "use strict";

    var utils = {
        // Properly format the expiration date
        formatDueDateTime: function(expDate) {
            return moment(expDate).format('lll');
        },
        /* TODO: Unhide and enable the button
              REQUIRED: must be called as such
                Utils.activateButton.call(this, buttonName)
        */
        activateButton: function(buttonName) {
            console.log('---', this);
            // var field = this.$('#' + fieldName);
            // field.trigger('control:hidden', false);
            // field.trigger('control:disabled', false);
        },
        /* Unhide and enable the given extended field
              REQUIRED: must be called as such
                Utils.activateField.call(this, fieldName)
        */
        activateField: function(fieldName) {
            var field = this.$('#' + fieldName);
            field.trigger('control:hidden', false);
            field.trigger('control:disabled', false);
        },
        /* Hide and disable all the active extended fields
              REQUIRED: must be called as such
                Utils.activateField.call(this, fieldName)
        */
        resetFields: function(fields) {
            fields = fields || [];
            _.forEach(fields, function(fieldName) {
                var field = this.$('#' + fieldName);
                if (field.length !== 0) {
                    field.trigger('control:hidden', true);
                    field.trigger('control:disabled', true);
                }
            }, this);
        },
        /* Given the select field, populate it with the provided select list
              REQUIRED: must be called as such
                Utils.activateField.call(this, fieldName)
        */
        populateSelectOptions: function(selectList, fieldName) {
            var template = _.template('<option value="<%= value %>"><%= name %></option>');
            var docFrag = $(document.createDocumentFragment());
            _.each(selectList, function(obj) {
                docFrag.append($(template(obj)));
            });
            this.$('#' + fieldName).html(docFrag);
        },

        // Given the formModel and the contents of the fields, it will populate
        //  fields with their corresponding values or set to ''
        setFields: function(formModel, fieldContents) {
            _.each(fieldContents, function(value, prop) {
                var val = value || '';
                formModel.set(prop, val);
            });
        },
        onEntryViewRender: function(date, taskVar) {
            if (taskVar.urgency && taskVar.urgency.toLowerCase() === 'emergent') {
                utils.activateField.call(this, 'attention');
            }
            if (!taskVar.urgency || taskVar.urgency === '') {
                taskVar.urgency = 'Routine';
                taskVar.earliestDate = date.format('L');
                taskVar.latestDate = date.add(30, 'd').format('L');
            }

        }
    };

    return utils;
});