define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/order.dischargefollowup/utils'
], function(Backbone, Marionette, _, Handlebars, Utils) {
    'use strict';

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to complete action.'),
        tagName: 'p'
    });

    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm"}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var modalFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid', 'all-padding-no'],
            items: [{
                control: 'container',
                template: Handlebars.compile('{{#if isStaffView}}<h5 class="font-size-14 top-margin-no top-padding-sm bottom-padding-sm">{{lastName}}, {{firstName}} ({{ssn}}), {{formatDate DOB "MM/DD/YYYY"}} ({{age}}y), {{fullGenderName}}</h5>{{/if}}'),
                extraClasses: ['background-color-primary-light', 'left-padding-sm', 'right-padding-sm']
            }, {
                control: 'container',
                template: Handlebars.compile('<p>Use this form to discontinue the Inpatient Discharge Follow-Up.</p>'),
                extraClasses: ['top-padding-sm', 'bottom-padding-md', 'left-padding-xl', 'right-padding-md']
            }, {
                control: 'textarea',
                name: 'comment',
                title: 'Comment',
                label: 'Comment',
                rows: 3,
                required: true,
                maxlength: 200,
                extraClasses: ['left-padding-md', 'right-padding-md']
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'button',
                    id: 'form-cancel-btn',
                    name: 'form-cancel-btn',
                    extraClasses: ['btn-primary', 'btn-sm', 'left-margin-xs'],
                    type: 'button',
                    label: 'Cancel'
                }, {
                    control: 'button',
                    disabled: true,
                    extraClasses: ['btn-primary', 'btn-sm'],
                    label: 'Accept',
                    name: 'submit-accept',
                    id: 'submit-accept'
                }]
            }]
        }]
    }];

    return ADK.UI.Form.extend({
        fields: modalFields,
        ui: {
            submitBtn: '.submit-accept',
            cancelBtn: '.form-cancel-btn'
        },
        events: {
            'click @ui.cancelBtn': function(e) {
                e.preventDefault();
                ADK.UI.Workflow.hide();
            },
            'click @ui.submitBtn': function(e) {
                var self = this;
                e.preventDefault();
                if (this.model.isValid()) {
                    var acceptActionModel = new ADK.UIResources.Writeback.Activities.Signal.Model();
                    Utils.buildAcceptActionModel(this.model, acceptActionModel);
                    acceptActionModel.save(null, {
                        success: function() {
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Inpatient Discharge Follow-Up Discontinued',
                                icon: 'fa-check',
                                message: 'Inpatient Discharge Follow-Up discontinued with no errors.'
                            });
                            saveAlertView.show();
                            ADK.UI.Workflow.hide();
                            ADK.UI.Modal.hide();
                            // close the response form if it is open
                            var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                            if (TrayView) {
                                TrayView.$el.trigger('tray.reset');
                            }
                            // refresh the list of active tasks
                            ADK.Messaging.getChannel('tray-tasks').trigger('action:refresh');
                            // refresh the tasks and activities applets
                            ADK.Messaging.getChannel('activities').trigger('create:success');
                            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                                processId: Number(_.get(self.model.get('clinicalObject'), 'data.activity.processInstanceId')),
                                showHighlights: self.model.get('showHighlights'),
                                highlights: self.model.get('detailsHighlights')
                            });
                        },
                        error: function() {
                            var errorAlertView = new ADK.UI.Alert({
                                title: 'Error',
                                icon: 'icon-circle-exclamation',
                                messageView: ErrorMessageView,
                                footerView: ErrorFooterView
                            });
                            errorAlertView.show();
                        }
                    });
                }
            }
        },
        modelEvents: {
            'change:comment': function() {
                if(this.model.get('comment')) {
                    this.ui.submitBtn.trigger('control:disabled', false);
                } else {
                    this.ui.submitBtn.trigger('control:disabled', true);
                }
            }
        }
    });
});