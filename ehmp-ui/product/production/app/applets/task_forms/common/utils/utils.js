define([
    'moment'
], function(moment) {
    "use strict";

    // NOTE this function also exists in RDK - they should be kept in sync, or perhaps
    //  moved into a common utility package in a new repository that they can both include
    function versionCompare(v1, v2) {
        // Split version numbers to its parts
        var v1parts = v1.split('.');
        var v2parts = v2.split('.');

        // Push 0 to the end of the version number that might be shorter
        //      ie. 1.2.3 and 1.2.3.4 => 1.2.3.0 and 1.2.3.4
        while (v1parts.length < v2parts.length) {
            v1parts.push('0');
        }

        while (v2parts.length < v1parts.length) {
            v2parts.push('0');
        }

        // Convert all values to numbers
        var convert = function(val) {
            val = val.replace(/\D/g, '');
            if (val.length === 0) {
                return Number.MAX_VALUE;
            }
            return Number(val);
        };
        v1parts = v1parts.map(convert);
        v2parts = v2parts.map(convert);

        for (var i = 0; i < v1parts.length; i++) {
            if (v1parts[i] === v2parts[i]) {
                continue;
            } else if (v1parts[i] > v2parts[i]) {
                return -1;
            } else if (v1parts[i] < v2parts[i]) {
                return 1;
            }
        }

        return 0;
    }

    var utils = {
        getTaskData: function(taskId, onSuccess) {
            var fetchOptions = {
                resourceTitle: 'tasks-gettask',
                fetchType: 'GET',
                cache: false,
                criteria: {
                    taskid: taskId
                },
                onSuccess: function(collection) {
                    onSuccess(collection);
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        getFacilities: function(onSuccess) {
            var fetchOptions = {
                resourceTitle: 'authentication-list',
                fetchType: 'GET',
                cache: true,
                onSuccess: function(collection) {
                    onSuccess(collection);
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        // Properly format the expiration date
        formatDueDateTime: function(expDate) {
            return moment(expDate).format('lll');
        },
        /* Unhide and enable the given extended field
              REQUIRED: must be called as such
                Utils.activateField.call(this, fieldName)
        */
        activateField: function(fieldName) {
            // Relying on the id is highly discouraged, as spelled out at:
            // <app-ip/url>/documentation/#/adk/ui-library/views#Form-Controls
            // Please do not re-use this pattern.
            // Utilize the ui hash, as this allows for
            // mapping selectors/elements with unlike selectors. i.e. this.ui[fieldName]
            // <app-ip/url>/documentation/#/adk/code-review-checklist%23Backbone-and-Marionette-Best-Practices
            var field = this.$('[id^=' + fieldName + ']');
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
                // Relying on the id is highly discouraged, as spelled out at:
                // <app-ip/url>/documentation/#/adk/ui-library/views#Form-Controls
                // Please do not re-use this pattern.
                // Utilize the ui hash, as this allows for
                // mapping selectors/elements with unlike selectors. i.e. this.ui[fieldName]
                // <app-ip/url>/documentation/#/adk/code-review-checklist%23Backbone-and-Marionette-Best-Practices
                var field = this.$('[id^=' + fieldName + ']');
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
            // Relying on the id is highly discouraged, as spelled out at:
            // <app-ip/url>/documentation/#/adk/ui-library/views#Form-Controls
            // Please do not re-use this pattern.
            // Utilize the ui hash, as this allows for
            // mapping selectors/elements with unlike selectors. i.e. this.ui[fieldName]
            // <app-ip/url>/documentation/#/adk/code-review-checklist%23Backbone-and-Marionette-Best-Practices
            this.$('[id^=' + fieldName + ']').html(docFrag);
        },

        // Given the formModel and the contents of the fields, it will populate
        //  fields with their corresponding values or set to ''
        setFields: function(formModel, fieldContents) {
            fieldContents = $.extend(true, {}, fieldContents);
            delete fieldContents.preReqQuestions;
            delete fieldContents.preReqOrders;
            _.each(fieldContents, function(value, prop) {
                var val = value || '';
                formModel.set(prop, val);
            });
        },
        onEntryViewRender: function(date, taskVar) {
            if (taskVar.urgency && taskVar.urgency.toLowerCase() === '2') {
                utils.activateField.call(this, 'acceptingProvider');
            }
            if (!taskVar.urgency || taskVar.urgency === '') {
                taskVar.urgency = '9';
                taskVar.earliestDate = date.format('L');
                taskVar.latestDate = date.add(30, 'd').format('L');
            }

        },
        getLatestConsult: function(processDefId, successParams, onSuccess) {
            var self = this;
            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function(response) {
                        // Add a unique identifier to the activities
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection, response) {
                    var latestConsult = self.findLatest(collection, processDefId);
                    // Add latest consult to the onSuccess parameters
                    successParams.latestConsult = latestConsult;
                    onSuccess(successParams);
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        // Find the latest deployment
        findLatest: function(collection, processDefId) {
            var selected = [];

            // Get only the consult deployments
            collection.each(function(model) {
                if (model.get('id') === processDefId) {
                    selected.push(model);
                }
            });

            // Get the list of just the deployment version numbers
            var versions = selected.map(function(model) {
                return model.get('deploymentId').split(':').pop();
            });

            // Find the location, in the array, for the largest value
            var newestIndex = 0;
            if (versions.length > 1) {
                for (var i = 1, l = versions.length; i < l; ++i) {
                    if (versionCompare(versions[newestIndex], versions[i]) === 1) {
                        newestIndex = i;
                    }
                }
            }

            return selected[newestIndex];
        },
        // Build assginedTo field for the fetchOptions
        buildAssignedTo: function(location, teamFocus) {
            var locationName = location.name;
            // Replace characters that will break parsing on the backend with '-'
            locationName = locationName.replace(/\(|\)|\:|\[|\]|\,/g, '-');

            // Ordering Facility Code
            var locationCode = location.code;

            // Build routing string
            var routing = '[FC:' + locationName + '(' + locationCode + ')/TF:' + teamFocus.name + '(' + teamFocus.code + ')]';
            return routing;
        }
    };

    return utils;
});
