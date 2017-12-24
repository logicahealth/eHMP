define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/error_reporting/writeback/issueForm'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars,
    IssueForm
) {
    'use strict';

    var ReportErrorButton = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'btn btn-xs btn-default font-size-11 left-margin-xs',
        attributes: {
            title: 'Report an issue with eHMP.'
        },
        behaviors: {
            Tooltip: {}
        },
        template: Handlebars.compile(
            '{{#if showWarning}}' +
            '<span class="fa-stack error-reporting-warning-icon" title="Issues detected." data-toggle="tooltip" aria-hidden="true">' +
            '<i class="fa fa-play fa-rotate-270 fa-stack-2x text-warning"></i>' +
            '<i class="fa fa-exclamation fa-stack-1x color-pure-black"></i>' +
            '</span>' +
            '<span class="sr-only">Issues detected. </span>' +
            '{{/if}}' +
            '{{label}}'
        ),
        templateHelpers: function() {
            return {
                label: this.getOption('label') || 'Report Issue'
            };
        },
        events: {
            'click': function(e) {
                e.preventDefault();
                this.showCreateIssueModal();
            },
            'reply:error:context': function(e, errorContext) {
                if (_.isObject(errorContext)) {
                    this.errorContext = errorContext;
                }
            }
        },
        modelEvents: function() {
            return {
                'change:showWarning': 'render'
            };
        },
        collectionEvents: function() {
            var collectionEvents = {};
            if (this.getOption('showErrorWarning')) {
                collectionEvents['update reset'] = function(collection, options) {
                    this.model.set('showWarning', this._shouldShowWarning(collection));
                };
            }
            return collectionEvents;
        },
        _shouldShowWarning: function(collection) {
            return !collection.isEmpty();
        },
        initialize: function() {
            this.errorContext = null;
            this.collection = _.get(ADK, 'Errors.collection');
            this.model = new Backbone.Model({
                showWarning: this.getOption('showErrorWarning') ? this._shouldShowWarning(this.collection) : false
            });
        },
        onRender: function() {
            if (this.model.get('showWarning')) this.$el.removeClass('btn-default').addClass('btn-info left-padding-xs');
            else this.$el.removeClass('btn-info left-padding-xs').addClass('btn-default');
        },
        onAttach: function() {
            if (this.getOption('errorModel')) this._registerErrorModel();
        },
        showCreateIssueModal: function() {
            var formModel = new ADK.UIResources.Writeback.IssueReport.Model();
            var workflowOptons = {
                title: this.getOption('modalTitle') || 'Report a problem',
                icon: this.getOption('modalIcon') || '',
                steps: [{
                    view: IssueForm,
                    viewModel: formModel,
                    stepTitle: 'Report a problem'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptons);
            workflow.show();
        },
        _registerErrorModel: function() {
            var errorModel = this.getOption('errorModel');
            var message = '';
            // will return context of closest ancestor listening (they should shut off)
            this.$el.trigger('request:error:context', 'reply:error:context');
            message += _.get(this, 'errorContext.title', '');
            message += _.isEmpty(message) ? '' : ' - ';
            message += errorModel.has('message') ? errorModel.get('message') : errorModel.get('status') + ' - ' + errorModel.get('statusText');
            var details = {};
            if (!_.isEmpty(_.get(this, 'errorContext.details'))) {
                details.errorContext = _.get(this, 'errorContext.details');
            }
            // TODO: how are we going to get the error?
            var errorModelAttributes = errorModel.toJSON();
            this._incidentModel = ADK.Errors.collection.add({
                message: message,
                details: _.extend(details, errorModelAttributes),
                requestId: _.get(errorModelAttributes, 'getResponseHeader', _.noop)('X-Request-ID'),
                errorLogId: errorModel.get('logId')
            });
            this.listenToOnce(this._incidentModel, 'remove', function() {
                this.destroy();
            });
        },
        onDestroy: function() {
            if (this._incidentModel instanceof Backbone.Model) {
                this.stopListening(this._incidentModel, 'remove');
                ADK.Errors.collection.remove(this._incidentModel);
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationFooterItem",
        group: "right",
        key: "errorReporter",
        view: ReportErrorButton.extend({
            label: 'Report An Issue',
            showErrorWarning: true,
            className: 'btn btn-xs btn-default font-size-11 left-margin-xs'
        }),
        orderIndex: 5,
        shouldShow: function() {
            return false;
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: "errorItem",
        key: "errorReporter",
        view: ReportErrorButton,
        shouldShow: function() {
            return true;
        }
    });

    return ReportErrorButton;
});
