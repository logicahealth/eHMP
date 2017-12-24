define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'main/components/behaviors/injectable'
], function(
    Backbone,
    Marionette,
    Handlebars,
    _,
    Injectable
) {
    "use strict";

    var ActionView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'btn btn-primary btn-action-arrow',
        template: Handlebars.compile([
            '<i class="icon-action-arrow font-size-10">',
            '<span class="sr-only">This {{iconActionType}} is actionable</span>',
            '</i>'
        ].join('\n')),
        templateHelpers: function() {
            return {
                iconActionType: _.get(this, 'actionOptions.actionType', 'Action')
            };
        },
        behaviors: {
            KeySelect: {}
        },
        events: {
            'click': function(event) {
                event.preventDefault();
                event.stopPropagation();
                var targetView = this.getOption('targetView');
                var actionOptions = _.result(this, 'actionOptions');
                if (_.isFunction(actionOptions.onClickButton)) {
                    actionOptions.onClickButton.call(targetView, event, _.get(targetView, 'model'));
                } else {
                    ADK.Errors.collection.add({
                        message: 'Action behavior: no onClickButton found',
                        details: ADK.Errors.omitNonJSONDeep(actionOptions.onClickButton, 'actionOptions.onClickButton', {})
                    });
                }
            }
        },
        attributes: function() {
            var targetView = this.getOption('targetView');
            this.tileOptions = targetView.getOption('tileOptions');
            this.actionOptions = _.result(this, 'tileOptions.actions');

            var titleLabel = 'Action';
            var disabledFlag = false;
            if (this.actionOptions) {
                if (_.isFunction(this.actionOptions.disableAction) && this.actionOptions.disableAction(targetView.model) === true) {
                    disabledFlag = true;
                    if (!_.isEmpty(this.actionOptions.actionType)) {
                        titleLabel = 'Disabled ' + _.capitalize(this.actionOptions.actionType);
                    } else {
                        titleLabel = 'Disabled Action';
                    }
                } else if (!_.isEmpty(this.actionOptions.actionType)) {
                    titleLabel = 'Go To ' + _.capitalize(this.actionOptions.actionType);
                }
            }

            return {
                'title': titleLabel,
                'aria-label': titleLabel,
                'disabled': disabledFlag
            };
        }
    });

    var ActionButton = Injectable.extend({
        className: 'actionbutton-container',
        component: 'actionbutton',
        childView: ActionView,
        tagName: 'div',
        containerSelector: '.action-container',
        insertMethod: 'append',
        shouldShow: function() {
            var tileOptions = this.getOption('tileOptions') || {};
            if (_.isFunction(_.get(tileOptions, 'actions.shouldShow'))) {
                return tileOptions.actions.shouldShow(this.model);
            }

            return _.result(tileOptions, 'actions.shouldShow', true);
        }
    });

    return ActionButton;
});