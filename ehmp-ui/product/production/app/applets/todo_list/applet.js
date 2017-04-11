define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/todo_list/views/todoListView'
], function(Backbone, Marionette, _, TodoListView) {
    "use strict";

    var applet = {
        id: 'todo_list',
        viewTypes: [{
            type: 'summary',
            view: TodoListView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: TodoListView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }],

        defaultViewType: 'summary'
    };

    return applet;
});