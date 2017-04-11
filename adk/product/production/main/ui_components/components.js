define([
    'underscore',
    'api/Messaging',
    'main/ui_components/forms/component',
    'main/ui_components/workflow/component',
    'main/ui_components/modal/component',
    'main/ui_components/fullscreen_overlay/component',
    'main/ui_components/tabs/component',
    'main/ui_components/alert/component',
    'main/ui_components/notification/component',
    'main/ui_components/tray/component',
    'main/ui_components/sub_tray/component',
    'main/ui_components/collapsible_container/component',
    'main/ui_components/applet_dropdown/component',
    'main/ui_components/applet_dropdown/alert_dropdown/component',
    'main/ui_components/pdfViewer/component'
], function(_, Messaging, PuppetForm, Workflow, Modal, FullScreenOverlay, Tabs, Alert, Notification, Tray, SubTray, CollapsibleContainer, Dropdown, AlertDropdown, PdfViewer) {
    'use strict';

    var UI_Componenets = {
        Form: PuppetForm.Form,
        FormViews: PuppetForm,
        Workflow: Workflow,
        Modal: Modal,
        FullScreenOverlay: FullScreenOverlay,
        Tabs: Tabs,
        Alert: Alert,
        Notification: Notification,
        Tray: Tray,
        SubTray: SubTray,
        CollapsibleContainer: CollapsibleContainer,
        Dropdown: Dropdown,
        AlertDropdown: AlertDropdown,
        PdfViewer: PdfViewer
    };


    /**
     * Messaging set up for component regions
     */
    var ComponentModel = Backbone.Model.extend({
        idAttribute: '_uniqueId',
        shouldShow: function() {
            var shouldShowMethod = this.get('shouldShow');
            if (_.isFunction(shouldShowMethod)) {
                return shouldShowMethod.apply(this, arguments);
            }
            return true;
        },
        isOfGroup: function(type, group) {
            return _.isEqual(this.get('type'), type)  && _.contains(this.get('group'), group);
        },
        isOfType: function(type) {
            return _.isEqual(this.get('type'), type);
        }
    });
    var ComponentCollection = Backbone.Collection.extend({
        model: ComponentModel,
        comparator: function(model) {
            return (model.get('orderIndex'));
        }
    });
    var componentCollection = new ComponentCollection();

    Messaging.on('register:component', function(options) {
        // options: {
        //     group: 'writeback', // placement of the component in the application
        //     key: 'observations', // unique identifier for the component
        //     view: ADK.UI.Tray.extend(), // actual component view definition
        //     shouldShow: function(){ return true/false;},
        //     orderIndex: 10 // order in which to display the component
        // }
        if (_.isString(options.type) && _.isString(options.key) && (_.isFunction(options.view) || _.isFunction(options.view.initialize))) {
            options._uniqueId = options.type + ':' + options.key;
            if (!_.isUndefined(options.group)) {
                if (_.isString(options.group)) {
                    options.group = [options.group];
                } else if (!(_.isArray(options.group) && _.all(options.group, function(item) {
                        return _.isString(item);
                    }))) {
                    console.error('Error when trying to register component with the following group option: ', options.group);
                    return false;
                }
            }
            if (!_.isUndefined(options.shouldShow) && !_.isFunction(options.shouldShow)) {
                console.error('Error when trying to register component with the following shouldShow method: ', options.shouldShow);
                return false;
            }
            if (!_.isUndefined(options.orderIndex) && !_.isNumber(options.orderIndex)) {
                console.error('Error when trying to register component with the following orderIndex option: ', options.orderIndex);
                return false;
            }
            componentCollection.add(options);
            return true;
        } else {
            console.error('Error when trying to register component with the following options: ', options);
            return false;
        }
    });

    Messaging.reply('get:components', function(iteratee) {
        if (!_.isFunction(iteratee) || _.isEmpty(componentCollection)) {
            return componentCollection;
        }

        return componentCollection.filter(iteratee);
    });

    // This is a global collection that gets used for all Component Sub-Items
    var ComponentItemModel = Backbone.Model.extend({
        hasKey: function(type, key) {
            return _.isEqual(this.get('type'), type) && _.contains(this.get('key'), key);
        }
    });
    var ComponentItemsCollection = Backbone.Collection.extend({
        model: ComponentItemModel,
        comparator: function(model) {
            return (model.get('label'));
        }
    });
    var componentItemsCollection = new ComponentItemsCollection();
    Messaging.on('register:component:item', function(options) {
        // options: {
        //     key: 'observations', // unique identifier for the component to register to
        //     label: 'Vitals', // label of action item that invokes onClick method
        //     onClick: function(){} // generally it will take action to display form
        //     shouldShow: function(){ return true/false;},
        // }
        if (_.isString(options.type) && !_.isUndefined(options.key)) {
            if (_.isString(options.key)) {
                options.key = [options.key];
            } else if (!(_.isArray(options.key) && _.all(options.key, function(item) {
                    return _.isString(item);
                }))) {
                console.error('Error when trying to register component item with the following key option: ', options.key);
                return false;
            }
            componentItemsCollection.add(options);
            return true;
        } else {
            console.error('Error when trying to register component item with the following options: ', options);
            return false;
        }
    });
    Messaging.reply('get:component:items', function() {
        return componentItemsCollection;
    });

    return UI_Componenets;
});

