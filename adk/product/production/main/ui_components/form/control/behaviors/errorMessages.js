define([
    'backbone',
    'marionette',
    'handlebars',
    'main/ui_components/form/classDefinitions'
], function(
    Backbone,
    Marionette,
    Handlebars,
    ClassDefinitions
) {
    "use strict";

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: Handlebars.compile('{{message}}'),
        className: function() {
            return ClassDefinitions.helpClassName + ' error';
        },
        attributes: function() {
            return {
                id: 'form-control-error-' + this.cid,
                tabindex: '-1'
            };
        },
        templateHelpers: function() {
            return {
                'message': this.getOption('message')
            };
        }
    });

    return Marionette.Behavior.extend({
        defaultOptions: {
            fieldSelector: '.form-control'
        },
        initialize: function(options) {
            this.options = _.defaults(options, this.defaultOptions);
            this.listenToFieldName();
        },
        onRender: function() {
            this.updateInvalid();
        },
        updateInvalid: function() {
            var errorModel = _.get(this, 'view.model.errorModel', _.get(this.view.getOption('model'), 'errorModel', null));
            if (!(errorModel instanceof Backbone.Model)) return;
            this.clearInvalid();
            var attrArr = this.view.field.get('name').split('.'),
                name = attrArr.shift(),
                path = attrArr.join('.'),
                error = errorModel.get(name);

            if (_.isEmpty(error)) return;
            if (_.isObject(error)) error = this.view.prototype.keyPathAccessor.call(this.view, error, path);
            if (_.isEmpty(error)) return;

            this.$el.addClass(ClassDefinitions.errorClassName);
            this.errorMessageView = new ErrorMessageView({
                message: _.isArray(error) ? error.join(", ") : error || ''
            });
            this.$el.append(this.errorMessageView.render().$el);
            var fieldSelector = _.isString(this.getOption('fieldSelector')) ? this.getOption('fieldSelector') : _.isFunction(this.getOption('fieldSelector')) ? this.getOption('fieldSelector')() : null;
            if (fieldSelector) {
                var describedBy = (this.$(fieldSelector).attr('aria-describedby') || '') + ' form-control-error-' + this.errorMessageView.cid;
                this.$(fieldSelector).attr('aria-describedby', describedBy.trim());
            }
        },
        clearInvalid: function() {
            var cid = _.get(this, 'errorMessageView.cid', '');
            if (this.errorMessageView instanceof ErrorMessageView) {

                this.errorMessageView.destroy();
            }
            delete this.errorMessageView;
            this.$el.removeClass(ClassDefinitions.errorClassName);
            var fieldSelector = _.isString(this.getOption('fieldSelector')) ? this.getOption('fieldSelector') : _.isFunction(this.getOption('fieldSelector')) ? this.getOption('fieldSelector')() : null;
            if (fieldSelector) {
                var describedBy = this.$(fieldSelector).attr('aria-describedby') || '';
                describedBy = describedBy.replace('form-control-error-' + cid, '');
                if (!_.isEmpty(describedBy)) {
                    this.$(fieldSelector).attr('aria-describedby', describedBy.trim());
                } else {
                    this.$(fieldSelector).removeAttr('aria-describedby');
                }
            }
        },
        listenToFieldName: function() {
            var errorModel = _.get(this, 'view.model.errorModel', _.get(this.view.getOption('model'), 'errorModel', null));
            this.modelName = this.view.getComponentInstanceName.call(this.view);
            if (errorModel instanceof Backbone.Model)
                this.listenTo(errorModel, "change:" + this.modelName, function() {
                    this.updateInvalid();
                });
        },
        onBeforeDestroy: function() {
            if (this.errorMessageView instanceof ErrorMessageView) {
                this.errorMessageView.destroy();
            }
            delete this.errorMessageView;
        }
    });
});
