define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/fields',
    'app/applets/task_forms/activities/consults/eventHandler'
], function(Backbone, Marionette, _, Handlebars, Utils, Fields, EventHandler) {
    "use strict";

    var urgencyMap = {
        '2': 'Emergent',
        '4': 'Urgent',
        '9': 'Routine'
    };

    var ProvideTaskModel = Backbone.Model.extend({
        defaults: {
            action: ''
        },
        validate: function(options) {
            this.errorModel.clear();
            var errormsgs = {};

            // Add form validation based on the action selected
            var action = $.trim(this.get('action'));
            switch (action) {
                case '':
                    // Validate action for all forms
                    errormsgs.action = 'Select an Action';
                    break;
                case 'assigned':
                    errormsgs.attention = 'Select an Attention';
                    break;
                case 'scheduled':
                    errormsgs.scheduledDate = 'Select Scheduled Date';
                    errormsgs.clinic = 'Select a Clinic';
                    errormsgs.provider = 'Enter Provider';
                    break;
                case 'contacted':
                    errormsgs.attempt = 'Select an Attempt';
                    break;
                case 'clarification':
                    errormsgs.question = 'Enter in question(s)';
                    break;
            }

            // Check for errors based on the case
            for (var key in errormsgs) {
                var value = $.trim(this.get(key));

                if (value === '') {
                    this.errorModel.set(key, errormsgs[key]);
                }
            }

            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        }
    });

    var ProvideTaskForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: Fields.requestFields,
        modelEvents: {
            'change:action': 'populateFields'
        },
        events: {
            'click #modal-close-button': 'fireCloseEvent',
            'click #modal-done-button': 'fireDoneEvent',
            'click #consult-overview-button': 'showOverview'
        },
        populateFields: function(e) {
            var selectList;

            Utils.resetFields.call(this, [
                'action', 'reason', 'clinic', 'contacted', 'attempt', 'question', 'communityCareStatus',
                'scheduledDate', 'provider', 'comment', 'attention', 'communityCare'
            ]);
            this.$('.econsult-reminder-text').trigger('control:hidden', true);
            Utils.activateField.call(this, 'action');

            // if e is null, exit here
            if (!e) return;

            switch (e.get('action')) {
                case 'triaged':
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'EWL':
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'eConsult':
                    Utils.activateField.call(this, 'comment');
                    this.$('.econsult-reminder-text').trigger('control:hidden', false);
                    break;
                case 'clarification':
                    Utils.activateField.call(this, 'question');
                    break;
                case 'communityCare':
                    Utils.activateField.call(this, 'communityCare');
                    Utils.activateField.call(this, 'communityCareStatus');
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'assigned':
                    Utils.activateField.call(this, 'attention');
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'scheduled':
                    Utils.activateField.call(this, 'scheduledDate');
                    Utils.activateField.call(this, 'clinic');
                    Utils.activateField.call(this, 'provider');
                    Utils.activateField.call(this, 'comment');
                    break;
                case 'contacted':
                    Utils.activateField.call(this, 'attempt');
                    Utils.activateField.call(this, 'comment');
                    selectList = [{
                        value: '',
                        name: ''
                    }, {
                        value: this.model.get('contactAttempt'),
                        name: this.model.get('contactAttempt')
                    }, {
                        value: 'other',
                        name: 'Other'
                    }];
                    Utils.populateSelectOptions.call(this, selectList, 'attempt');
                    break;
            }
        },
        setCommentLabel: function(label) {
            if (label) {
                // Set to given label
                this.$el.find('.comment label').html(label);
            } else {
                // Reset to 'Comment'
                this.$el.find('.comment label').html('Comment');
            }
        },
        onInitialize: function(options) {
            // Clean up null or empty values
            this.model.attributes = _.omit(this.model.attributes, function(i) {
                return i === null || i === '';
            });

            var self = this;
            var model = this.model;
            if (model.errorModel) {
                model.errorModel.clear();
            }

            this.mapUrgencyCodeToName(model);

            var showUrgency = false;
            var urgency = model.get('urgency').toLowerCase();
            if (urgency === 'urgent' || urgency === 'emergent') {
                showUrgency = true;
            }

            var urgencyTag = 'label-warning';
            if (urgency === 'emergent') {
                urgencyTag = 'label-critical';
            }

            var isComment = model.get('requestComment') ? true : false;
            model.set({
                showUrgency: showUrgency,
                urgencyTag: urgencyTag,
                isComment: isComment
            });

            // Claim the task
            EventHandler.claimTask(model);

            // Listen to changes on required fields
            this.listenTo(model,
                'change:action change:reason change:attention change:attempt change:scheduledDate change:clinic change:provider change:communityCare change:question change:communityCareStatus',
                this.onModelChange, this);
        },
        ui: {
            'provider': '.control.provider',
            'inProgressContainer': '.inProgressContainer',
            'clinic': '.control.select-control.clinic'
        },
        onShow: function() {
            this.onModelChange();
            this.blockUI();
        },
        onRender: function(options) {
            var self = this;

            // Fetch clinic list and populate the clinic dropdown
            var url = ADK.ResourceService.buildUrl('write-pick-list', {
                type: 'clinics-fetch-list',
                site: ADK.UserService.getUserSession().get('site'),
            });
            var urlFetch = new Backbone.Collection();
            var people = new ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility();

            urlFetch.url = url;
            urlFetch.fetch({
                error: function(collection, res) {
                    var picklist = self.$('.control.select-control.clinic');
                    picklist.trigger('control:picklist:error', res.responseText);
                    picklist.focus();
                    urlFetch.reset();
                    self.unBlockUI();
                },
                success: function(collection) {
                    var clinics = [];
                    _.each(collection.models, function(model) {
                        var label = model.get('name');
                        // substitute spaces for _ 
                        var value = label.replace(/ /g, '_');
                        clinics.push({
                            label: label,
                            value: value
                        });
                    });

                    window.requestAnimationFrame(function() {
                        self.ui.clinic.trigger('control:picklist:set', [clinics]);
                    });
                    self.unBlockUI();
                }
            });

            window.requestAnimationFrame(function() {
                self.$('.control.select-control.action').trigger('control:picklist:set', [self.actions]);
            });

            this.listenToOnce(people, 'read:success', function(collection, response) {
                if (response && response.data) {
                    var items = _.sortBy(response.data, 'name');
                    self.ui.provider.trigger('control:picklist:set', [items]);
                }
            });

            people.fetch({
                facilityID: ADK.UserService.getUserSession().get('division')
            });

            // Populate the fields on form
            this.populateFields();
        },
        behaviors: {
            Tooltip: {
                placement: 'auto left'
            }
        },
        showOverview: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('processInstanceId')
            });
        },
        onModelChange: function() {
            var activate = true;
            var requiredFields = [];
            var model = this.model;
            var action = $.trim(model.get('action'));
            if (action) {
                switch (action) {
                    case 'assigned':
                        requiredFields = [
                            $.trim(model.get('attention')),
                        ];
                        break;
                    case 'scheduled':
                        requiredFields = [
                            $.trim(model.get('scheduledDate')),
                            $.trim(model.get('clinic')),
                            $.trim(model.get('provider'))
                        ];
                        break;
                    case 'contacted':
                        requiredFields = [
                            $.trim(model.get('contactAttempt'))
                        ];
                        break;
                    case 'clarification':
                        requiredFields = [
                            $.trim(model.get('question'))
                        ];
                        break;
                    case 'communityCare':
                        requiredFields = [
                            $.trim(model.get('communityCare')),
                            $.trim(model.get('communityCareStatus'))
                        ];
                        break;
                }

                for (var x = 0, length = requiredFields.length; x < length; ++x) {
                    if (requiredFields[x] === '') {
                        activate = false;
                        break;
                    }
                }
            } else {
                activate = false;
            }

            if (activate) {
                this.$('#modal-done-button').attr('disabled', false);
            } else {
                this.$('#modal-done-button').attr('disabled', true);
            }
        },
        blockUI: function(message) {
            var self = this;
            this.model.set('inProgressMessage', message || 'Loading...');
            this.ui.inProgressContainer.trigger('control:hidden', false);
            this.$(':input')
                .each(function() {
                    var $this = $(this);
                    var $control = $this.parents('.control');
                    var data = $control.data() || $this.data();

                    var disabled = $this.attr('disabled');
                    if (data.hasOwnProperty('uiblock') || disabled === 'disabled') {
                        return;
                    }
                    if (disabled === undefined) {
                        disabled = 'undefined';
                    }

                    if ($control.length) {
                        $control.trigger('control:disabled', true).data('uiblock', disabled);
                    } else {
                        $this.attr('disabled', true).data('uiblock', disabled);
                    }

                });
        },
        unBlockUI: function() {
            this.model.unset('inProgressMessage');
            this.ui.inProgressContainer.trigger('control:hidden', true);
            this.$(':input')
                .each(function() {
                    var $this = $(this);
                    var $control = $this.parents('.control');
                    var data = $control.data() || $this.data();
                    var disabled = _.get(data, 'uiblock');

                    if (!data.hasOwnProperty('uiblock')) {
                        return;
                    }

                    if (disabled === 'undefined') {

                        if ($control.length) {
                            $control.trigger('control:disabled', false).removeData('uiblock');
                        } else {
                            $this.removeAttr('disabled').removeData('uiblock');
                        }

                    }
                });
        },
        fireCloseEvent: function(e) {
            this.mapUrgencyNameToCode(this.model);
            EventHandler.releaseTask(e, this);
            this.blockUI('Processing...');
        },
        fireDoneEvent: function(e) {
            if (!this.model.isValid()) {
                return false;
            }

            // Correct action for contacting patient
            var model = this.model;
            if (model.get('action') === 'contacted' && model.get('attempt') === 'other') {
                model.set('action', 'other');
            }

            this.mapUrgencyNameToCode(this.model);
            EventHandler.completeTask(e, this);
            this.blockUI('Processing...');
        },
        mapUrgencyCodeToName: function(model) {
            var urgency = model.get('urgency');
            var urgencyName = urgencyMap[urgency];
            model.set('urgency', urgencyName);

        },
        mapUrgencyNameToCode: function(model) {
            var urgency = model.get('urgency');
            var urgencyCode = _.invert(urgencyMap)[urgency];
            model.set('urgency', urgencyCode);

        }
    });

    return {
        form: ProvideTaskForm,
        model: ProvideTaskModel
    };
});
