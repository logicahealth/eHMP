define([
	'backbone',
	'marionette'
], function(Backbone, Marionette) {
	'use strict';

	return ADK.UI.Form.extend({
        fields: [{
            control: 'container',
            extraClasses: ['form-inline', 'pixel-height-30'],
            template: '<p class="faux-label" aria-hidden="true">Filter Team(s):</p>',
            items: [{
                control: 'select',
                name: 'dischargeTeamFilter',
                label: 'Filter Team(s):',
                srOnlyLabel: true,
                multiple: true,
                options: {
                    placeholder: 'You may select more than one',
                    minimumInputLength: 0
                },
                extraClasses: ['left-border-no', 'percent-width-50'],
                pickList: [],
                showFilter: true,
                disabled: true
            }]
        }],
        ui: {
            'dischargeTeamFilter': '.dischargeTeamFilter'
        }
    });
});