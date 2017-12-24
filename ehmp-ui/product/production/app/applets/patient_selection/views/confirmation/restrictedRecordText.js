define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';

    var RestrictedRecordText = Backbone.Marionette.ItemView.extend({
        closedIcon: 'fa-caret-right',
        openIcon: 'fa-caret-down',
        template: Handlebars.compile(
            '{{#if shouldShowDisclaimer}}' +
            '<div id="ackMsgTitleId">' +
            '<h4 class="panel-title">' +
            '<button type="button" class="btn btn-link" id="ackMessageCollapse{{getId}}" data-toggle="collapse" data-target="#ackMessagePanel{{getId}}" aria-expanded="{{isOpenOnLoad}}" aria-controls="ackMessagePanel">' +
            '<i class="fa fa-caret-{{#if isOpenOnLoad}}down{{else}}right{{/if}}" aria-hidden="true"></i> {{ackTitle}}' +
            '{{#if isAcknowledged}}<span class="acknowledged"> Acknowledged <i class="fa fa-check-square-o"></i></span>{{/if}}' +
            '</button>' +
            '</h4>' +
            '</div>' +
            '<div id="ackMessagePanel{{getId}}" class="panel-collapse collapse{{#if isOpenOnLoad}} in{{else}} bottom-border-pure-white bottom-margin-xs{{/if}}">' +
            '<div class="panel-body">' +
            '<span class="sr-only">RESTRICTED RECORD.</span> {{ackMessage}}' +
            '</div>' +
            '</div>' +
            '{{else if shouldShowSenstiveWarning}}' +
            '<div class="row">' +
            '<div class="col-xs-offset-4 col-xs-4 text-center background-color-pure-white color-red bottom-margin-md font-size-14 sensitive-patient"><span class="sr-only">Sensitive info: </span>*SENSITIVE*</div>' +
            '</div>' +
            '{{/if}}'
        ),
        templateHelpers: function() {
            var acknowledgedAttr = 'acknowledged';
            var confirmedAttr = 'confirmed';
            var isAcknowledged = this.model.get(acknowledgedAttr);
            return {
                shouldShowDisclaimer: !!this.model.get('sensitive') &&
                    (_.isEqual(this.getOption('skipAttribute'), acknowledgedAttr) || isAcknowledged),
                shouldShowSenstiveWarning: !!this.model.get('sensitive') && _.isEqual(this.getOption('skipAttribute'), confirmedAttr),
                isAcknowledged: isAcknowledged,
                isOpenOnLoad: function() {
                    return this.shouldShowDisclaimer && !this.isAcknowledged;
                },
                getId: this.cid
            };
        },
        ui: {
            AccordionToggleIcon: 'button i[class*=fa-caret]'
        },
        events: {
            'show.bs.collapse': 'onDisclaimerShow',
            'hide.bs.collapse': 'onDisclaimerHide'
        },
        onDisclaimerShow: function() {
            this.ui.AccordionToggleIcon.removeClass(this.getOption('closedIcon')).addClass(this.getOption('openIcon'));
        },
        onDisclaimerHide: function() {
            this.ui.AccordionToggleIcon.removeClass(this.getOption('openIcon')).addClass(this.getOption('closedIcon'));
        }
    });
    return RestrictedRecordText;
});
