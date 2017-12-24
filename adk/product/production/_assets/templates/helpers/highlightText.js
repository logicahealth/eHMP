define(['handlebars', 'main/Utils'], function(Handlebars, Utils) {
    "use strict";
    var highlightText = function(text, breakLines) {
        if (_.isString(text)) {
            /* Safely escapes all text outside handlbars helpers delarations
             * ex: '<div>my escaped string</div> {{ andHandlbarDef "with other params"}}'
             * parses to: '&lt;div&gt;my escaped string&lt;/div&gt; {{ andHandlbarsDef "with other params"}}'
             */
            var escapedTextWithHandlebarsPreserved = text.replace(/({{.*?}})*(.*?)(?={{|$)/g, function(match, handlebarsExpression, expressionToEscape) {
                handlebarsExpression = handlebarsExpression || '';
                expressionToEscape = expressionToEscape || '';
                return handlebarsExpression + Handlebars.Utils.escapeExpression(expressionToEscape);
            });
            var html = Handlebars.compile(escapedTextWithHandlebarsPreserved)();
            if (breakLines === true) {
                html = Utils.breakLines(html);
            }
            return new Handlebars.SafeString(html);
        }
    };

    Handlebars.registerHelper('highlightText', highlightText);
    return highlightText;
});