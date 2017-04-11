define([
    'handlebars',
    'app/applets/task_forms/activities/simple_activity/utils/countdown'
], function(Handlebars, countdown) {
    "use strict";

    var originalView;
    var taskListView;

    var eventHandler = {
        editSimpleTask: function(e, listView) {
            taskListView = listView;
            var self = this;
            var newDueDate, followup, fetchOptions, newStartDate, startinterval;
            fetchOptions = {
                resourceTitle: 'tasks-changestate',
                fetchType: 'POST',
                criteria: {
                    taskid: this.model.get('id')
                }
            };
            var buttonClicked = null;
            if (this.model.get('followup')) {
                newDueDate = moment(this.model.get('newduedate') + ' ' + this.model.get('newduetime')).format('YYYY-MM-DD HH:mm');
                newStartDate = moment(this.model.get('newstartdate') + ' ' + this.model.get('newstarttime')).format('YYYY-MM-DD HH:mm');
                if (moment(newStartDate).valueOf() <= moment().valueOf()) {
                    startinterval = '0';
                } else {
                    startinterval = countdown(
                        moment().toDate(),
                        moment(newStartDate).toDate(),
                        countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
                    );

                    startinterval = '' + (startinterval.days + 'd') + (startinterval.hours + 'h') + (startinterval.minutes + 'm') + (startinterval.seconds + 's');
                }

                followup = true;
            } else {
                newDueDate = this.model.get('duedatetime');
                newStartDate = this.model.get('startdatetime');
                followup = false;
                if (moment(newStartDate).valueOf() <= moment().valueOf()) {
                    startinterval = '0';
                } else {
                    startinterval = countdown(
                        moment().toDate(),
                        moment(newStartDate).toDate(),
                        countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
                    );

                    startinterval = '' + (startinterval.days + 'd') + (startinterval.hours + 'h') + (startinterval.minutes + 'm') + (startinterval.seconds + 's');
                }

            }

            switch (e.currentTarget.getAttribute('id')) {
                case 'modal-start-button':
                    fetchOptions.criteria.state = 'start';
                    buttonClicked = 'start';
                    break;

                case 'modal-release-button':
                    fetchOptions.criteria.state = 'release';
                    buttonClicked = 'release';
                    break;

                case 'modal-complete-button':
                    fetchOptions.criteria.state = 'complete';
                    fetchOptions.criteria.user = 'Susan';
                    fetchOptions.criteria.deploymentid = 'All';
                    fetchOptions.criteria.parameter = {
                        'out_completionnote': this.model.get('out_completionnote'),
                        'out_duedate': newDueDate,
                        'out_markasfollowup': followup,
                        'out_startdate': newStartDate,
                        'out_startinterval': startinterval
                    };
                    buttonClicked = 'complete';
                    break;
                default:
                    fetchOptions.criteria.state = 'start';
            }

            fetchOptions.onSuccess = function(collection, response) {

                switch (buttonClicked) {
                    case 'start':
                        self.model.set('status', 'InProgress');
                        break;
                    case 'release':
                        self.model.set('status', 'Ready');
                        break;
                    case 'complete':
                        self.model.set('status', 'Complete');
                        ADK.UI.Modal.hide();
                        break;
                }

                taskListView.refresh();
                // taskListView.$el.parents('[data-appletid="task_list"]')
                //         .find('.applet-refresh-button')
                //         .trigger('click');
                // // $('[data-appletid="task_list"]')
                //     .find('.applet-refresh-button')
                //     .trigger('click');
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

        },
        startProcess: function(e, listView) {

            taskListView = listView;
            if (this.parentView.formModel.isValid()) {
                var formInfo = this.parentView.formModel.toJSON(true);
                delete formInfo.componentList;
                var fetchOptions = {
                    resourceTitle: 'tasks-startprocess',
                    fetchType: 'POST',
                    criteria: {
                        deploymentId: 'All',
                        processDefId: formInfo.tasktype,
                        parameter: formInfo
                    }
                };

                fetchOptions.onSuccess = function(collection, resp) {
                    var MessageView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('The Process has been Started'),
                        tagName: 'h5'
                    });
                    var FooterView = Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('{{ui-button "Continue" classes="btn-primary" title="Press enter to continue."}}'),
                        events: {
                            'click .btn-primary': function() {
                                ADK.UI.Alert.hide();
                                ADK.UI.Modal.hide();
                                taskListView.refresh();
                                // taskListView.$el.parents('[data-appletid="task_list"]')
                                //     .find('.applet-refresh-button')
                                //     .trigger('click');
                            }
                        },
                        tagName: 'span'
                    });

                    new ADK.UI.Alert({
                        title: 'Alert!',
                        icon: 'fa-exclamation-triangle',
                        messageView: MessageView,
                        footerView: FooterView
                    }).show();

                    $(e.target).button('created');

                };

                $(e.target).button('creating');
                ADK.ResourceService.fetchCollection(fetchOptions);
            }

        }

    };

    return eventHandler;
});