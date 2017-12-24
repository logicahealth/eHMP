define([
    'underscore',
    'jquery',
    'app/applets/permission_sets/workflows/permission-sets-abstract-form'
], function(_, $, AbstractForm) {
    'use strict';

    var STEP_INDEX = 1;


    /**
     * Permission Sets Create Form Step One - Data Fields
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return AbstractForm.extend({
        ui: {
            label: '.control.setName',
            category: '.control.sub-sets',
            description: '.control.description',
            alert: '.control.alertMessage',
            versions: '.control.introduced'
        },

        events: {
            'blur @ui.label': 'unlock',
            'keyup @ui.label': 'domUnlock',
            'blur @ui.category': 'unlock',
            'blur @ui.description': 'unlock'
        },

        modelEvents: {
            'change:category': 'unlock',
            'change:description': 'unlock'
        },

        onInitialize: function onInitialize() {
            this.addComponents();
            AbstractForm.prototype.onInitialize.apply(this, arguments);
        },
        /**
         * Not a standard function, called when workflow setp is changed.
         * Populates the version select field.
         */
        onStep: function onStep() {
            if (this.getIndex() === STEP_INDEX) {
                this.ui.versions.trigger('control:picklist:set', [this.versions.toJSON()]);
                this.ui.category.trigger('control:picklist:set', [this.categories.toJSON()]);

                var version = this.model.get('version');
                var introduced = _.get(version, 'introduced', false);

                if (introduced) {
                    this.model.set('introduced', introduced);
                }

                if (!_.isFunction(this.next)) {
                    // It lost the button for some reason
                    this.ui.submit = this.$(this.ui.submit.selector);
                }

                $('#mainWorkflow').focus();
            }
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        next: function next(event) {
            event.preventDefault();

            var label = this.model.get('setName');

            if (this._permissionSets.isUniqueLabel(label)) {
                this.workflow.goToNext();
            } else {
                var message = 'Permission Set Name "';
                message += label;
                message += '" already exists, and must be unique';

                this.ui.alert.trigger('control:message', message);
            }
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        cancel: function cancel(event) {
            event.preventDefault();
            ADK.UI.Workflow.hide();
        },

        /**
         * Edit form will override onInitialize, this is a short cut to get
         * this information back.
         */
        addComponents: function addComponents() {
            this.addComponent(this.getAlertControl());
            this.addComponent(this.getNameStatusField());
            this.addComponent(this.getIntroducedCategoryField());
            this.addComponent(this.getDescriptionField());
            this.addComponent(this.getNotesField());
            this.addComponent(this.getExamplesField());
        },

        /**
         * Checks to see if enough of the form is complete to unlock
         * the `next` or `submit` button
         */
        unlock: function unlock() {
            if (_.isFunction(this.next)) {
                this.ui.next.trigger('control:disabled', !this.isFilled());
            } else {
                this.ui.submit.trigger('control:disabled', !this.isFilled());
            }
        },

        /**
         * A slower unlock function because of DOM access, used because input does not
         * fire change events until blur.
         */
        domUnlock: function domUnlock() {
            var hasLabel = _.isEmpty(_.get(this, 'el.elements.setName.value'));
            var hasDescription = _.isEmpty(this.model.get('description'));
            var hasCategory = _.isEmpty(this.model.get('sub-sets'));
            var isMissingData = hasLabel || hasCategory || hasDescription;

            if (_.isFunction(this.next)) {
                this.ui.next.trigger('control:disabled', isMissingData);
            } else {
                this.ui.submit.trigger('control:disabled', isMissingData);
            }
        },

        /**
         * Checks the model to see if the required data exists
         * @return {boolean}
         */
        isFilled: function isFilled() {
            var alphaNumeric = /^[a-z0-9]+/i;

            var name = this.model.get('setName');
            var description = this.model.get('description');
            var categories = this.model.get('sub-sets');

            var hasName = alphaNumeric.test(name);
            var hasDescription = alphaNumeric.test(description);
            var hasCategories = _.isArray(categories) && categories.length;

            return hasName && hasCategories && hasDescription;
        },

        getNameStatusField: function getNameStatusField() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'input',
                    type: 'text',
                    name: 'setName',
                    label: 'Permission Set Name',
                    required: true,
                    extraClasses: ['col-xs-6']
                }, {
                    control: 'select',
                    label: 'Status',
                    name: 'status',
                    required: true,
                    extraClasses: ['col-xs-6', 'permission-sets-picklist'],
                    pickList: [{
                        label: 'Active',
                        value: 'active'
                    }, {
                        label: 'Inactive',
                        value: 'inactive'
                    }],
                    emptyDefault: false
                }]
            };
        },

        getAlertControl: function getAlertControl() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'alertBanner',
                    name: 'alertMessage',
                    extraClasses: 'col-xs-12',
                    dismissible: true,
                    type: 'warning',
                    icon: 'fa-exclamation-triangle'
                }]
            };
        },

        getIntroducedCategoryField: function getIntroducedCategoryField() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'select',
                    label: 'Introduced in eHMP version',
                    name: 'introduced',
                    required: true,
                    extraClasses: ['col-xs-6', 'permission-sets-picklist'],
                    emptyDefault: false

                }, {
                    control: 'select',
                    label: 'Permission Set Categories',
                    name: 'sub-sets',
                    required: true,
                    extraClasses: ['col-xs-6'],
                    multiple: true,
                    showFilter: true,
                    options: {
                        minimumInputLength: 0
                    },
                    emptyDefault: false
                }]
            };
        },

        getDescriptionField: function getDescriptionField() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'textarea',
                    extraClasses: ['col-xs-12'],
                    required: true,
                    label: 'Description',
                    name: 'description'
                }]
            };
        },

        getNotesField: function getNotesField() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'textarea',
                    extraClasses: ['col-xs-12'],
                    label: 'Notes',
                    name: 'note'
                }]
            };
        },

        getExamplesField: function getExamplesField() {
            return {
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'textarea',
                    extraClasses: ['col-xs-12'],
                    label: 'Examples',
                    name: 'example'
                }]
            };
        }
    });
});