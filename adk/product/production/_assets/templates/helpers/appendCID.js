define(
    ['handlebars', 'underscore'],
    function(Handlebars) {
        'use strict';

        function appendCID(id_string) {
            return _.uniqueId(id_string + '-');
        }

        Handlebars.registerHelper('appendCID', appendCID);
        return appendCID;
    }
);
