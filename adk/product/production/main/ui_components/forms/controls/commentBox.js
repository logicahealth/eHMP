define([
    'backbone',
    'puppetForm',
    'handlebars',
    'api/UserService',
    'moment',
    'main/accessibility/components'
], function(Backbone, PuppetForm, Handlebars, UserService, Moment, Accessibility) {
    'use strict';

    var CommentTextInputView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="input-region col-xs-7 all-padding-no"></div>',
            '<div class="button-region col-xs-5 all-padding-no"></div>'
        ].join('\n')),
        ui: {
            'InputRegion': '.input-region',
            'ButtonRegion': '.button-region'
        },
        regions: {
            'InputRegion': '@ui.InputRegion',
            'ButtonRegion': '@ui.ButtonRegion'
        },
        childEvents: {
            'add:comment': function(child) {
                this.performSave('add:comment');
            },
            'edit:comment': function(child) {
                this.performSave('edit:comment');
            },
            'cancel:edit:comment': function(child) {
                this.ui.InputRegion.find('input').val('').trigger('input');
                this._internalModel.set({
                    inputString: '',
                    editMode: false
                });
                this.triggerMethod('cancel:edit:comment');
            }
        },
        events: _.defaults({
            'input @ui.InputRegion input': function(e) {
                var currentString = this.$(e.target).val();
                if (this._internalModel.get('saveDisabled') && currentString.length > 0 && ((!this._internalModel.get('editMode') && this.previousInputString != currentString) || (this._internalModel.get('editMode') && currentString != this._internalModel.get('inputString')))) {
                    this._internalModel.set('saveDisabled', false);
                } else if (!this._internalModel.get('saveDisabled') && (currentString.length === 0 && this.previousInputString.length > currentString.length) || ((!this._internalModel.get('editMode') && this.previousInputString === currentString && currentString.length != this.inputOptions.maxlength) || (this._internalModel.get('editMode') && currentString === this._internalModel.get('inputString')))) {
                    this._internalModel.set('saveDisabled', true);
                }
                this.previousInputString = currentString;
            }
        }, PuppetForm.CommonPrototype.events),
        initialize: function() {
            this.collection = this.getOption('collection');
            this._internalModel = this.getOption('internalModel');
            this.field = this.getOption('field');
            this.defaults = this.getOption('defaults');
            this.previousInputString = "";
        },
        onBeforeShow: function() {
            var fieldInputOptions = this.field.get('inputOptions') || {};
            fieldInputOptions.disabled = this.field.get('disabled') || false;
            this.inputOptions = _.defaults(fieldInputOptions, {
                control: "input",
                name: "inputString",
                title: "Enter in a comment",
                placeholder: "Add comment",
                maxlength: 60,
                charCount: true,
                label: "Comment Box",
                srOnlyLabel: true,
                readonly: false
            });
            var commentInputViewField = new PuppetForm.Field(_.defaults({
                placeholder: _.isNumber(this.field.get('maxComments')) && this._internalModel.get('collectionLength') >= this.field.get('maxComments') ? this.defaults.exceededCommentLimitPlaceholder : this.inputOptions.placeholder,
                readonly: _.isNumber(this.field.get('maxComments')) ? this._internalModel.get('collectionLength') >= this.field.get('maxComments') : false,
                title: _.isNumber(this.field.get('maxComments')) && this._internalModel.get('collectionLength') >= this.field.get('maxComments') ? this.defaults.exceededCommentLimitTitle : this.inputOptions.title,
                label: _.isNumber(this.field.get('maxComments')) && this._internalModel.get('collectionLength') >= this.field.get('maxComments') ? this.defaults.exceededCommentLimitLabel : this.inputOptions.label
            }, this.inputOptions));
            this.showChildView('InputRegion', new PuppetForm.InputControl({
                field: commentInputViewField,
                model: this._internalModel
            }));
            this.showChildView('ButtonRegion', new CommentButtonView({
                model: this._internalModel,
                field: this.field,
                collection: this.getOption('collection')
            }));
            this.listenTo(this.field, 'change:disabled', function(model, newState) {
                this.InputRegion.currentView.$el.trigger('control:disabled', newState);
            });
            this.listenTo(this._internalModel, 'change:editMode', function(model, editState){
                if (!this.field.get('disabled')) {
                    this.InputRegion.currentView.$el.trigger('control:disabled', editState);
                }
            });
            var previousCommentLimitExceededState = _.isNumber(this.field.get('maxComments')) && this._internalModel.get('collectionLength') >= this.field.get('maxComments');
            this.listenTo(this._internalModel, 'change:collectionLength', function(model, collectionLength) {
                var commentLimitExceeded = _.isNumber(this.field.get('maxComments')) && collectionLength >= this.field.get('maxComments');
                if (previousCommentLimitExceededState != commentLimitExceeded) {
                    this.ui.InputRegion.find('.input-control').trigger('control:update:config', {
                        readonly: commentLimitExceeded,
                        placeholder: commentLimitExceeded ? this.defaults.exceededCommentLimitPlaceholder : this.inputOptions.placeholder,
                        title: commentLimitExceeded ? this.defaults.exceededCommentLimitTitle : this.inputOptions.title,
                        label: commentLimitExceeded ? this.defaults.exceededCommentLimitLabel : this.inputOptions.label
                    });
                    previousCommentLimitExceededState = commentLimitExceeded;
                }
            });
        },
        performSave: function(eventName) {
            this._internalModel.set('inputString', this.ui.InputRegion.find('input').val());
            this.triggerMethod(eventName);
        }
    });

    var CommentTextView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        getTemplate: function() {
            var commentTemplate = this.getOption('commentTemplate');
            return _.isFunction(commentTemplate) ? commentTemplate : _.isString(commentTemplate) ? Handlebars.compile(commentTemplate) : Handlebars.compile('{{comment}}{{#if timeStamp}} {{timeStamp}}{{/if}}{{#if name}} - {{name}}{{/if}}');
        },
        initialize: function(options) {
            this.attributeMapping = this.getOption('attributeMapping');
            this.field = this.getOption('field');
        },
        onShow: function() {
            this.listenTo(this.model, 'change:' + this.attributeMapping.comment, this.render);
        },
        serializeModel: function(model) {
            var commentTemplate = this.getOption('commentTemplate');
            var data = _.defaults({
                comment: model.get(this.attributeMapping.comment),
                author: model.get(this.attributeMapping.author),
                timeStamp: model.get(this.attributeMapping.timeStamp),
                name: (model.get(this.attributeMapping.author) ? model.get(this.attributeMapping.author).name : ''),
            }, _.defaults(this.field.attributes, this.defaults));
            return data;
        }
    });

    var CommentItemView = Backbone.Marionette.LayoutView.extend({
        getTemplate: function() {
            var itemInEditMode = this._itemModel.get('editMode');
            if (_.isBoolean(itemInEditMode) && itemInEditMode) {
                return Handlebars.compile([
                    '<div class="table-cell comment-edit-region top-padding-sm bottom-padding-xs"></div>'
                ].join('\n'));
            }
            // if the current item/row is currently editing, then otherwise, if we are in edit mode, the other
            // rows should be disabled
            return Handlebars.compile([
                '<div class="table-cell comment-text-region top-padding-xs bottom-padding-xs"></div>',
                '<div class="table-cell pixel-width-55 text-right">',
                '{{#if userIsAllowedEditDelete}}' +
                '<span>',
                '{{#if allowEdit}}<button type="button" ' + (this.field.get('disabled') || this._internalModel.get('editMode') ? 'disabled="disabled"' : '') +
                'class="comment-edit-button font-size-12 btn btn-icon right-padding-xs left-padding-xs" title="Press enter to edit comment: {{comment}} {{timeStamp}} - {{name}}">' +
                '<i class="fa fa-pencil"></i></button>{{/if}}',
                '{{#if allowDelete}}<button type="button" ' + (this.field.get('disabled') || this._internalModel.get('editMode') ? 'disabled="disabled"' : '') +
                'class="comment-delete-button font-size-12 button btn btn-icon right-padding-xs left-padding-xs" title="Press enter to delete comment: {{comment}} {{timeStamp}} - {{name}}">' +
                '<i class="fa fa-trash"></i></button>{{/if}}',
                '</span>' +
                '{{/if}}',
                '</div>'
            ].join('\n'));
        },
        ui: {
            'CommentEditButton': '.comment-edit-button',
            'CommentDeleteButton': '.comment-delete-button',
            'CommentTextRegion': '.comment-text-region',
            'CommentEditRegion': '.comment-edit-region'
        },
        regions: {
            'CommentTextRegion': '@ui.CommentTextRegion',
            'CommentEditRegion': '@ui.CommentEditRegion'
        },
        events: {
            'click @ui.CommentEditButton': 'queueEditComment',
            'click @ui.CommentDeleteButton': 'removeComment'
        },
        childEvents: {
            'cancel:edit:comment': function() {
                this._itemModel.set('editMode', false);
                this.resetInternalModel();
            },
            'edit:comment': function(child) {
                this.saveEditComment(child);
                this.resetInternalModel();
            }
        },
        initialize: function(options) {
            this.formModel = this.getOption('formModel');
            this.attributeMapping = this.getOption('attributeMapping');
            this.field = this.getOption('field');
            this.listenTo(this.field, 'change:disabled', function(model, newState){
                var itemInEditMode = this._itemModel.get('editMode');
                if(_.isBoolean(itemInEditMode) && !itemInEditMode && this.CommentTextRegion.hasView()){
                    this.render();
                }
            });
            this._internalModel = this.getOption('internalModel');
            var RowModel = Backbone.Model.extend({
                defaults: {
                    editMode: false,
                    inputString: '',
                    currentSaveDisabledState: false
                }
            });
            this._itemModel = new RowModel();
        },
        onRender: function() {
            // this view is expected to render often. It is important to turn of the listeners set up in
            // previous renders
            this.alterListeners('stopListening');
            this.showViews();
            this.alterListeners('listenTo');
        },
        showViews: function() {
            var itemInEditMode = this._itemModel.get('editMode');
            if (_.isBoolean(itemInEditMode) && itemInEditMode && !this.CommentEditRegion.hasView()) {
                this.showChildView('CommentEditRegion', new CommentTextInputView({
                    model: this._internalModel,
                    field: this.field,
                    collection: this.collection,
                    internalModel: this._itemModel,
                    defaults: this.defaults
                }));
                this.$el.addClass('non-muted');
            } else {
                this.showChildView('CommentTextRegion', new CommentTextView({
                    commentTemplate: this.getOption('commentTemplate'),
                    attributeMapping: this.attributeMapping,
                    formModel: this.formModel,
                    field: this.field,
                    internalModel: this._internalModel,
                    defaults: this.getOption('defaults'),
                    model: this.model
                }));
                if (this._internalModel.get('editMode')) {
                    this.$el.addClass('muted');
                } else {
                    this.$el.removeClass('muted');
                    this.$el.removeClass('non-muted');
                }
            }
        },
        alterListeners: function(action) {
            if (_.isFunction(this[action])) {
                this[action](this.model, 'change:' + this.attributeMapping.comment, this.focusEditButton);
                this[action](this._internalModel, 'change:editMode', this.render);
            }
        },
        resetInternalModel: function() {
            this._internalModel.set({
                editMode: false,
                saveDisabled: this._itemModel.get('currentSaveDisabledState')
            });
        },
        saveEditComment: function(child) {
            var currentUser = UserService.getUserSession();
            var authorObject = {
                name: currentUser.get('lastname') + ',' + currentUser.get('firstname'),
                duz: currentUser.get('duz')
            };
            var setObject = {};
            setObject[this.attributeMapping.comment] = this._itemModel.get('inputString');
            setObject[this.attributeMapping.author] = authorObject;
            setObject[this.attributeMapping.timeStamp] = new Moment().format('MM/DD/YYYY h:mma');
            this.model.set(setObject);
            Accessibility.Notification.new({
                'type': 'Polite',
                'message': 'Comment has been edited. This comment now reads: ' + this._itemModel.get('inputString')
            });
            this.ui.CommentEditRegion.find('input').val('').trigger('input');
            this._itemModel.set({
                inputString: '',
                editMode: false
            });
            this.triggerMethod('save:edit:comment', arguments);
        },
        queueEditComment: function(e) {
            // needs to be set prior to the _internalModel editMode being set since change of that creates render
            this._itemModel.set({
                inputString: this.model.get(this.attributeMapping.comment),
                editMode: true,
                currentSaveDisabledState: this._internalModel.get('saveDisabled')
            });
            this._internalModel.set({
                editMode: true,
                commentIndex: this._index,
                saveDisabled: true
            });
            this.ui.CommentEditRegion.find('input').trigger('input').focusTextToEnd();
            Accessibility.Notification.new({
                'type': 'Assertive',
                'message': 'Currently editing comment with message of: ' + this.model.get(this.attributeMapping.comment)
            });
        },
        removeComment: function(e) {
            this.triggerMethod('remove:comment');
        },
        className: 'table-row',
        templateHelpers: function() {
            var self = this;
            return {
                userIsAllowedEditDelete: function() {
                    return self.allowAction('allowEdit') || self.allowAction('allowDelete');
                },
                allowEdit: function() {
                    return self.allowAction('allowEdit');
                },
                allowDelete: function() {
                    return self.allowAction('allowDelete');
                }
            };
        },
        allowAction: function(fieldAttribute) {
            var fieldAllowAction = this.field.get(fieldAttribute);
            if (_.isFunction(fieldAllowAction)) {
                var cloneModel = this.model.clone();
                cloneModel.set = function() {
                    console.error('Cannot perform set on read-only model.');
                };
                fieldAllowAction = fieldAllowAction(cloneModel);
                cloneModel = null;
            }
            return _.isBoolean(fieldAllowAction) ? fieldAllowAction : true;
        },
        focusEditButton: function() {
            if ((!_.isNull(this._internalModel.get('commentIndex')) && this._index === this._internalModel.get('commentIndex')) || (_.isNull(this._internalModel.get('commentIndex')) && !this._internalModel.get('editMode'))) {
                this.ui.CommentEditButton.focus();
            }
        },
        onDomRefresh: function() {
            this.focusEditButton();
        },
        serializeModel: function(model) {
            var data = _.defaults({
                comment: model.get(this.attributeMapping.comment),
                timeStamp: model.get(this.attributeMapping.timeStamp),
                name: (model.get(this.attributeMapping.author) ? model.get(this.attributeMapping.author).name : ''),
            }, _.defaults(this.field.attributes, this.defaults));
            return data;
        }
    });

    var CommentButtonView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{#if shouldDisplayEdit}}' +
            '<div class="col-xs-6 left-padding-xs right-padding-no">',
            '<button type="button" class="cancel-edit-comment-button btn btn-default btn-block btn-sm" title="Press enter to cancel edit of comment">Cancel</button>',
            '</div>',
            '<div class="col-xs-6 left-padding-xs right-padding-no">',
            '<button {{#if shouldDisableSave}} disabled="disabled"{{/if}}type="button" class="edit-comment-button btn btn-primary btn-block btn-sm" title="Press enter to save edit of comment">Save</button>',
            '</div>',
            '{{else}}' +
            '<div class="col-xs-{{#if additionalAddCommentButton}}6{{else}}12{{/if}} left-padding-xs right-padding-no">',
            '<button type="button" class="add-comment-button btn btn-primary btn-block btn-sm" title="Press enter to add comment"{{#if shouldDisableSave}} disabled="disabled"{{/if}}>Add</button>',
            '</div>' +
            '{{#if additionalAddCommentButton}}' +
            '<div class="col-xs-6 left-padding-xs right-padding-no">',
            '<button type="button" class="additional-comment-button btn btn-default btn-block btn-sm" title="Press enter to {{additionalAddCommentButton.label}} comments">{{additionalAddCommentButton.label}}</button>',
            '</div>' +
            '{{/if}}',
            '{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            var self = this;
            return {
                shouldDisableSave: function() {
                    return self.field.get('disabled') || this.collectionLength >= self.field.get('maxComments') || this.saveDisabled;
                },
                shouldDisplayEdit: function() {
                    return !this.topLevel && _.isBoolean(this.editMode) && this.editMode;
                }
            };
        },
        ui: {
            'AddCommentButton': '.add-comment-button',
            'EditCommentButton': '.edit-comment-button',
            'CancelEditCommentButton': '.cancel-edit-comment-button',
            'AdditionalAddCommentButton': '.additional-comment-button'
        },
        events: {
            'click @ui.AddCommentButton': 'addComment',
            'click @ui.EditCommentButton': 'editComment',
            'click @ui.CancelEditCommentButton': 'cancelEditComment',
            'click @ui.AdditionalAddCommentButton': function(e) {
                this.ui.AdditionalAddCommentButton.trigger('click:additional:comment:button');
            }
        },
        initialize: function(options) {
            this.field = this.getOption('field');
            this.listenTo(this.field, 'change:disabled', this.render);
        },
        addComment: function(e) {
            this.triggerMethod('add:comment');
        },
        editComment: function(e) {
            this.triggerMethod('edit:comment');
        },
        cancelEditComment: function(e) {
            this.triggerMethod('cancel:edit:comment');
        },
        modelEvents: {
            'change:saveDisabled': 'render'
        },
        serializeModel: function(model) {
            var attributes = model.toJSON();
            var field = _.defaultsDeep(this.field.toJSON(), this.defaults);
            field = _.defaults(field, attributes);
            return field;
        }
    });

    var CommentCollectionView = Backbone.Marionette.CollectionView.extend({
        childView: CommentItemView,
        childViewOptions: function() {
            return {
                attributeMapping: this.attributeMapping,
                formModel: this.formModel,
                field: this.field,
                internalModel: this.getOption('internalModel'),
                defaults: this.getOption('defaults'),
                commentTemplate: this.getOption('commentTemplate')
            };
        },
        emptyView: Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('Write at least one comment.<input class="comments-required-input" type="number" min="1" value={{collectionLength}} tabIndex="-1" oninvalid="setCustomValidity(\'{{requiredError}}\')">'),
            className: 'comment-required'
        }),
        emptyViewOptions: function() {
            return {
                model: this.getOption('internalModel')
            };
        },
        isEmpty: function(collection) {
            return this.collection.length === 0 && this.getOption('internalModel').get('required');
        },
        initialize: function(options) {
            this.attributeMapping = options.attributeMapping;
            this.formModel = options.formModel;
            this.field = options.field;

            this.listenTo(options.internalModel, 'change:required', this.render);
        },
        className: "body"
    });

    var CommentBoxPrototype = {
        defaults: {
            maxComments: false,
            commentTemplate: null,
            allowEdit: null,
            allowDelete: null,
            exceededCommentLimitPlaceholder: "Comment limit exceeded",
            exceededCommentLimitTitle: "The comment limit has exceeded. To enter a new comment, remove an existing comment.",
            exceededCommentLimitLabel: "Comment Box Disabled",
            addCommentPosition: 'bottom',
            disabled: false
        },
        attributeMappingDefaults: {
            comment: "commentString",
            author: "author",
            timeStamp: "timeStamp"
        },
        className: function() {
            return PuppetForm.CommonPrototype.className() + ' comment-box bottom-margin-none';
        },
        template: Handlebars.compile([
            '{{#if isAddCommentTop}}<div class="comment enter-comment-region bottom-padding-sm top-margin-xs"></div>{{/if}}',
            '<div class="faux-table-container comments-container background-color-pure-white"><div class="comment-region top-padding-xs faux-table all-margin-no top-border"></div></div>',
            '{{#unless isAddCommentTop}}<div class="comment enter-comment-region top-margin-xs"></div>{{/unless}}'
        ].join('\n')),
        ui: {
            'CommentRegion': '.comment-region',
            'EnterCommentRegion': '.enter-comment-region'
        },
        regions: {
            'CommentRegion': '@ui.CommentRegion',
            'EnterCommentRegion': '@ui.EnterCommentRegion'
        },
        templateHelpers: function() {
            var self = this;
            return {
                isAddCommentTop: function() {
                    var addCommentPosition = self.field.get('addCommentPosition') || self.defaults.addCommentPosition;
                    return _.isString(addCommentPosition) && addCommentPosition === 'top';
                }
            };
        },
        initialize: function(options) {
            this.formModel = options.formModel || null;
            this.initOptions(options);
            this.setAttributeMapping();
            this.setFormatter();
            this.fieldChangeListener = function() {
                return;
            };
            this.listenToFieldOptions();
            var name = this.getComponentInstanceName();

            this.commentTemplate = this.field.get('commentTemplate') || null;
            this.initCollection('collection');
            this.collection = options.collection || this.collection;
            var CommentBoxInternalModel = Backbone.Model.extend({
                defaults: {
                    inputString: "",
                    editMode: false,
                    required: !!this.field.get('required'),
                    requiredError: 'This field is required. Write at least one comment.',
                    commentIndex: null,
                    saveDisabled: true,
                    collectionLength: this.collection.length,
                    topLevel: true
                }
            });
            this._internalModel = new CommentBoxInternalModel();
            // comments collection view
            this.commentCollectionView = new CommentCollectionView({
                collection: this.collection,
                formModel: this.formModel,
                attributeMapping: this.attributeMapping,
                field: this.field,
                internalModel: this._internalModel,
                defaults: this.defaults,
                commentTemplate: this.commentTemplate
            });

            this.stopListening(this.model, "change:" + name, this.render);
            this.model.set(name, this.collection);
            this.listenTo(this.model, "change:" + name, this.render);

            this.listenToFieldName();
            this.listenTo(this.collection, 'change add remove', function() {
                this.model.trigger('change', this.model);
                this._internalModel.set('collectionLength', this.collection.length);
            });
            if (!_.isFunction($.fn.focusTextToEnd)) {
                $.fn.focusTextToEnd = function() {
                    this.focus();
                    var $thisVal = this.val();
                    this.val('').val($thisVal);
                    return this;
                };
            }
        },
        events: _.defaults({
            'control:disabled': function(event, controlDisabled) {
                this.setBooleanFieldOption("disabled", controlDisabled, event);
                event.stopPropagation();
            },
            'control:required': function(e, booleanValue) {
                this._internalModel.set('required', booleanValue);
                e.stopPropagation();
            }
        }, PuppetForm.CommonPrototype.events),
        childEvents: {
            'remove:comment': function(child) {
                var self = this;
                child.$el.addClass('hidden');
                Accessibility.Notification.new({
                    'type': 'Assertive',
                    'message': 'Comment with message of: ' + child.model.get(this.attributeMapping.comment) + ' has been removed from the list.'
                });
                var deleteCommentAlert = new ADK.UI.Alert({
                    title: "Comment Deleted",
                    icon: "icon-triangle-exclamation",
                    messageView: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile(['<p>You have deleted a comment.</p>'].join('\n'))
                    }),
                    footerView: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile([
                            '{{ui-button "Restore" type="button" classes="btn-sm btn-default restore-button" title="Press enter to restore."}}',
                            '{{ui-button "OK" type="button" classes="btn-sm btn-primary no-button" title="Press enter to continue."}}'
                        ].join('\n')),
                        ui: {
                            'NoButton': '.no-button',
                            'RestoreButton': '.restore-button'
                        },
                        events: {
                            'click @ui.RestoreButton': function() {
                                ADK.UI.Alert.hide();
                                child.$el.removeClass('hidden');
                                if (child.ui.CommentEditButton && child.ui.CommentEditButton.length > 0) {
                                    child.ui.CommentEditButton.focus();
                                } else if (child.ui.CommentDeleteButton && child.ui.CommentDeleteButton.length > 0) {
                                    child.ui.CommentDeleteButton.focus();
                                } else {
                                    self.ui.EnterCommentRegion.find('input').focus();
                                }
                                Accessibility.Notification.new({
                                    'type': 'Assertive',
                                    'message': 'Comment with message: ' + child.model.get(self.attributeMapping.comment) + ' has been restored to the list.'
                                });
                            },
                            'click @ui.NoButton': function() {
                                ADK.UI.Alert.hide();
                                if (self._internalModel.get('editMode') === true) {
                                    self._internalModel.set({
                                        inputString: self.ui.EnterCommentInputRegion.find('input').val(''),
                                        editMode: false
                                    });
                                }
                                self.collection.remove(child.model);
                                if (!_.isUndefined(self.collection.at(child._index))) {
                                    var childToReceiveFocus = self.commentCollectionView.children.find(function(childView) {
                                        return childView._index === child._index;
                                    });
                                    if (childToReceiveFocus) {
                                        if (childToReceiveFocus.ui.CommentEditButton && childToReceiveFocus.ui.CommentEditButton.length > 0) {
                                            childToReceiveFocus.ui.CommentEditButton.focus();
                                        } else if (childToReceiveFocus.ui.CommentDeleteButton && childToReceiveFocus.ui.CommentDeleteButton.length > 0) {
                                            childToReceiveFocus.ui.CommentDeleteButton.focus();
                                        } else {
                                            self.ui.EnterCommentRegion.find('input').focus();
                                        }
                                    }
                                } else {
                                    self.ui.EnterCommentRegion.find('input').focus();
                                }
                                self.onUserInput.apply(self, arguments);
                            }
                        }
                    })
                });
                deleteCommentAlert.show();
            },
            'add:comment': function(child) {
                this.saveComment();
            },
            'save:edit:comment': function() {
                this.onUserInput.apply(this, arguments);
            }
        },
        commonRender: PuppetForm.CommonPrototype.onRender,
        onRender: function() {
            this.commonRender();
            this.showChildView('CommentRegion', this.commentCollectionView);
            this.showChildView('EnterCommentRegion', new CommentTextInputView({
                model: this._internalModel,
                field: this.field,
                collection: this.collection,
                internalModel: this._internalModel,
                defaults: this.defaults
            }));
            this.listenTo(this._internalModel, 'change:editMode', function(internalModel, booleanValue) {
                this.ui.EnterCommentRegion.toggleClass('muted', booleanValue);
            });
            this.$el.trigger('control:required', this.field.get('required'));
        },
        saveComment: function() {
            if (this._internalModel.get('inputString').length > 0) {
                var currentUser = UserService.getUserSession();
                var authorObject = {
                    name: currentUser.get('lastname') + ',' + currentUser.get('firstname'),
                    duz: currentUser.get('duz')
                };
                var commentIndex = this._internalModel.get('commentIndex');
                var newModelObject = {};
                newModelObject[this.attributeMapping.comment] = this._internalModel.get('inputString');
                newModelObject[this.attributeMapping.author] = authorObject;
                newModelObject[this.attributeMapping.timeStamp] = new Moment().format('MM/DD/YYYY hh:mm');
                this._internalModel.set('commentIndex', this.collection.length);
                this.collection.add(new Backbone.Model(newModelObject));
                Accessibility.Notification.new({
                    'type': 'Polite',
                    'message': 'Comment has been added to the list with the message of: ' + this._internalModel.get('inputString')
                });
                this.ui.EnterCommentRegion.find('input').val('').trigger('input');
                this._internalModel.set({
                    inputString: '',
                    saveDisabled: true
                });
                this.onUserInput.apply(this, arguments);
            }
        }
    };

    var CommentBox = PuppetForm.CommentBoxControl = Backbone.Marionette.LayoutView.extend(
        _.defaults(CommentBoxPrototype, _.defaults(PuppetForm.CommonPrototype, PuppetForm.CommonEventsFunctions))
    );

    return CommentBox;
});