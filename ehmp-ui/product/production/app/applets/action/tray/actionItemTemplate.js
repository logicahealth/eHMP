define([
    'handlebars'
], function(Handlebars) {
    'use strict';

    return Handlebars.compile([
        '<a href="#li-item" data-uniqueID="{{itemUniqueId}}" title="Press enter to open {{itemLabel}}">',
        '{{#if isTask}}',
        '    <div class="col-xs-10 left-margin-lg">',
        '        <h5 class="all-margin-no all-padding-no" id="{{formatIdString groupLabel}}-{{formatIdString summaryLabel}}-list-title-{{formatIdString itemUniqueId}}">',
        '            <span class="sr-only">Task Title</span> {{itemLabel}}',
        '            {{#if isPastDue}}',
        '                <span aria-hidden="true">-</span> <span class="sr-only">Task status</span><span class="color-red bold-font text-uppercase">{{itemStatus}}</span>',
        '            {{else}}',
        '                {{#if isDue}}',
        '                    <span aria-hidden="true">-</span> <span class="sr-only">Task status</span><span class="color-primary bold-font text-uppercase">{{itemStatus}}</span>',
        '                {{/if}}',
        '            {{/if}}',
        '        </h5>',
        '    </div>',
        '    <div class="col-xs-2 text-right">',
        '        <span class="sr-only">Task priority</span> {{priorityText}}',
        '    </div>',
        '{{else}}',
        '    <div class="col-xs-12 left-margin-lg">',
        '        <h5 class="all-margin-no all-padding-no" id="{{formatIdString groupLabel}}-{{formatIdString summaryLabel}}-list-title-{{formatIdString itemUniqueId}}">',
        '            <span class="sr-only">Task Title</span> {{itemLabel}}',
        '        </h5>',
        '        {{#if formattedReferenceDate}}',
        '            <p>',
        '                <span class="sr-only">Date and time stamp</span>',
        '                <span id="{{formatIdString groupLabel}}-note-list-date-{{formatIdString itemUniqueId}}">{{{formattedReferenceDate}}}</span>',
        '            </p>',
        '        {{/if}}',
        '        {{#if itemStatus}}',
        '            <p>',
        '                <span id="{{formatIdString groupLabel}}-note-list-status-{{formatIdString itemUniqueId}}">Status: {{itemStatus}}</span>',
        '            </p>',
        '        {{/if}}',
        '    </div>',
        '{{/if}}',
        '</a>',
    ].join('\n'));
});
