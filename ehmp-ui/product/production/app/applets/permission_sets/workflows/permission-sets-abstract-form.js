define([
    'underscore',
    'backbone',
    'hbs!app/applets/permission_sets/templates/workflow-label'
], function(_, Backbone, labelTemplate) {
    'use strict';

    var SPACE_REGEX = /\s/g;


    /**
     * Permission Sets Abstract Form for Create and Edit.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ

     * The View is use to create short cuts for common controls on the create and edit forms.
     *
     * It can auto-generate a footer by specifying next, back, cancel, submit functions
     * from the extending class.
     */
    return ADK.UI.Form.extend({
        behaviors: {
            KeySelect: {}
        },

        fields: [],
        ui: {},
        events: {},

        /**
         * Overridden to create the footer, and merge events/ui fields
         */
        initialize: function initialize() {
            this._abstract = this._abstractDefaults();
            this._createFooter();
            this.ui = _.extend({}, this._abstract.ui, this.ui);
            this.events = _.extend({}, this._abstract.events, this.events);
            ADK.UI.Form.prototype.initialize.apply(this, arguments);
        },

        onInitialize: function() {
            this.fields.push(this._abstract.container);
            this.fields.push(this._abstract.footer);
            if (_.isFunction(this.onStep)) {
                this.listenTo(this.workflow.model, 'change:currentIndex', this.onStep);
            }
        },

        /**
         * Short hand method to get the step of the workflow
         * @return {Number} The current step of the workflow
         */
        getIndex: function getIndex() {
            return this.workflow.model.get('currentIndex');
        },

        /**
         * A shorthand method to add an item into the body
         * @param {*} component A form Component
         */
        addComponent: function addComponent(component) {
            this._abstract.container.items.push(component);
        },

        /**
         * A template helper for adding an additional label to a multi select
         * @param {String} labelText
         */
        addLabelArea: function addLabelArea(labelText) {
            this.addComponent({
                control: 'container',
                template: labelTemplate({type: labelText})
            });
        },

        /**
         * Populates a multi select form component and adds it to the body
         * @param {String} label The text to show of the multi select
         * @param {Collection} collection A backbone collection
         * @param {Handlebars} detailsTemplate A handlebars template to draw the details button
         * @param {Boolean} isRequired
         */
        addMultiSelect: function addMultiSelect(label, collection, detailsTemplate, isRequired) {
            var name = this.labelToClass(this._abstract.multiSelectPrefix, label);

            this.addLabelArea(label);
            isRequired = isRequired || false;

            this.addComponent({
                control: 'multiselectSideBySide',
                name: name,
                label: label,
                attributeMapping: {
                    id: 'uid',
                    label: 'label',
                    value: 'selected'
                },
                collection: collection,
                required: isRequired,
                detailsPopoverOptions: {
                    options: {
                        placement: function() {
                            var BOTTOM_BUFFER_PX = 100;

                            var buttonOffset = this.$element.offset().top;
                            var modalOffset = this.$viewport.offset().top;
                            var offsetFromModal = buttonOffset - modalOffset;
                            var modalHeight = this.$viewport.height();
                            var distanceToBottom = modalHeight - offsetFromModal;
                            return distanceToBottom < BOTTOM_BUFFER_PX ? 'auto top' : 'auto left';
                        },
                        container: 'body'
                    },
                    items: [{
                        control: 'container',
                        template: detailsTemplate
                    }]
                }
            });
        },

        /**
         * Converts label text to a class selector
         * @param {String} prefix
         * @param {String} label
         * @return {String}
         */
        labelToClass: function labelToClass(prefix, label) {
            var text = label.toLowerCase();
            text = text.replace(SPACE_REGEX, '-');
            return prefix + '-' + text;
        },

        /**
         * Creates a button and adds it to the footer
         * @param {String} id
         * @param {String} name
         * @param {String} type
         * @param {boolean} isDisabled
         */
        addButton: function addButton(id, name, type, isDisabled, extraClasses) {
            this._abstract.footer.items.push({
                control: 'button',
                label: name,
                type: type,
                id: id,
                extraClasses: extraClasses || ['btn-default'],
                disabled: isDisabled
            });
        },

        /**
         * Factory to generate defaults
         * @private
         */
        _abstractDefaults: function _abstractDefaults() {
            return {
                collections: [],
                buttonIdPrefix: 'permissions-sets-button',
                multiSelectPrefix: 'multi-select',
                container: {
                    control: 'container',
                    extraClasses: ['modal-body', 'all-padding-md'],
                    items: []
                },
                footer: {
                    control: 'container',
                    extraClasses: 'modal-footer',
                    items: []
                },
                ui: {},
                events: {}
            };
        },

        /**
         * Builds a button and binds events too it.
         * @private
         */
        _createButton: function _createButton(name, disabled, extraClasses) {
            var id = this._abstract.buttonIdPrefix + '-' + name;
            this._abstract.ui[name] = '#' + id;
            this._abstract.events['click @ui.' + name] = name;
            this.addButton(id, name,'button', disabled, extraClasses);
        },

        /**
         * Creates a footer based on existing function.
         * @private
         */
        _createFooter: function _createFooter() {
            if (_.isFunction(this.cancel)) {
                this._createButton('cancel', false, ['btn-default', 'right-margin-sm']);
            }
            if (_.isFunction(this.back)) {
                this._createButton('back', false, ['btn-default', 'right-margin-sm']);
            }
            if (_.isFunction(this.next)) {
                this._createButton('next', true);
            }
            if (_.isFunction(this.submit)) {
                var id = this._abstract.buttonIdPrefix + '-' + 'submit';
                this._abstract.ui.submit = '#' + id;
                this._abstract.events.submit = 'submit';
                this.addButton(id, 'Save', 'submit', true);
            }
        }
    });
});