define([
    'backbone',
    'marionette',
    'main/ui_components/form/utils',
    'main/ui_components/form/classDefinitions',
    'main/ui_components/form/control/formatters/default',
    'main/ui_components/form/control/behaviors/bahaviors'
], function(
    Backbone,
    Marionette,
    ControlUtils,
    ClassDefinitions,
    DefaultFormatter,
    FormControlBehaviors
) {
    "use strict";

    return {
        behaviors: {
            HideEvent: {
                behaviorClass: FormControlBehaviors.HideEvent,
                selector: null // this.$el by default
            },
            RequiredFieldOptions: {
                behaviorClass: FormControlBehaviors.RequiredFieldOptions
            },
            ExtraClasses: {
                behaviorClass: FormControlBehaviors.ExtraClasses
            },
            DefaultClasses: {
                behaviorClass: FormControlBehaviors.DefaultClasses
            },
            ErrorMessages: {
                behaviorClass: FormControlBehaviors.ErrorMessages
            }
        },
        defaults: {}, // Additional field defaults
        requiredFields: ['name', 'label'], // These are the DEFAULT fields that are required
        /* TODO: NOT SURE WHAT className SHOULD BE HERE */
        className: function() {
            return "control form-group";
        },
        initOptions: function(options) {
            this.field = options.field; // Back-reference to the field
        },
        formatter: DefaultFormatter,
        setFormatter: function() {
            var Formatter = ControlUtils.resolveNameToClass(this.field.get("formatter") || this.formatter, "Formatter");
            if (!_.isFunction(Formatter.fromRaw) && !_.isFunction(Formatter.toRaw)) {
                Formatter = new Formatter();
            }
            this.formatter = Formatter;
        },
        setAttributeMapping: function() {
            if (_.isObject(this.attributeMappingDefaults)) {
                this.attributeMapping = _.defaults(this.field.get('attributeMapping') || {}, this.attributeMappingDefaults);
            }
        },
        // Included For All Controls
        _initialize: function(options){
            this.initOptions(options);
            this.setFormatter();
            this.setAttributeMapping();
        },
        initialize: function(options) {
            this.listenToFieldName();
            this.listenToFieldOptions();
        },
        clearErrorModelValue: function(name, path) {
            if (this.model.errorModel instanceof Backbone.Model) {
                if (_.isEmpty(path || "")) {
                    this.model.errorModel.unset(name);
                } else {
                    var nestedError = this.model.errorModel.get(name);
                    if (nestedError) {
                        this.keyPathSetter(nestedError, path, null);
                        this.model.errorModel.set(name, nestedError);
                    }
                }
            }
        },
        modelChangeListener: null, // Allows controls to determine what happens on change of model
        onModelChange: function() {
            var attrArr = this.field.get("name").split('.');
            var name = attrArr.shift();
            var path = attrArr.join('.');
            this.clearErrorModelValue(name, path);
            var callback = this.modelChangeListener || this.render;
            callback.apply(this, arguments);
        },
        listenToFieldName: function() {
            this.modelName = this.getComponentInstanceName();
            this.listenTo(this.model, "change:" + this.modelName, this.onModelChange);
        },
        fieldChangeListener: null, // Allows controls to determine what happens on change of the field model
        listenToFieldOptions: function() {
            this.listenTo(this.field, "change", this.fieldChangeListener || this.render);
        },
        serializeModel: function(model, moreOptions) {
            var field = _.defaultsDeep(this.field.toJSON(), this.defaults);
            var attributes = model.toJSON();
            var attrArr = field.name.split('.');
            var name = attrArr.shift();
            var path = attrArr.join('.');
            var rawValue = this.keyPathAccessor(attributes[name], path);
            var value = this.formatter.fromRaw(rawValue, model);

            _.extend(field, {
                rawValue: rawValue,
                value: value,
                attributes: attributes,
                formatter: this.formatter
            });

            if (field.prependToDomId) {
                field.name = field.prependToDomId + name;
                if (field.id) {
                    field.id = field.prependToDomId + field.id;
                }
            }

            if (moreOptions) _.extend(field, moreOptions);

            this.fieldModel = {
                rawValue: rawValue,
                value: value
            };

            return field;
        },
        onUserInput: function() {
            this.model.trigger('change.inputted', this.model, this.model.changedAttributes());
            this.model.trigger('change.inputted:' + this.modelName, this.model, (this.model.changedAttributes()[this.modelName] || this.model.get(this.modelName)));
        },
        onChange: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var model = this.model,
                attrArr = this.field.get("name").split('.'),
                name = attrArr.shift(),
                path = attrArr.join('.'),
                value = this.getValueFromDOM(),
                changes = {};

            this.clearErrorModelValue(name, path);

            changes[name] = _.isEmpty(path) ? value : _.clone(model.get(name)) || {};
            if (!_.isEmpty(path)) this.keyPathSetter(changes[name], path, value);
            this.stopListening(this.model, "change:" + name, this.onModelChange);
            if (_.isFunction(this.getSelectedLabelFromDOM)) {
                this.model.trigger('labelsForSelectedValues:update', name, this.getSelectedLabelFromDOM());
            }
            model.set(changes);
            this.listenTo(this.model, "change:" + name, this.onModelChange);
            return model.changedAttributes();
        },



        /* --------- TODO: MOVE TO ControlService ? -------- */
        keyPathAccessor: function(obj, path) {
            var res = obj || {};
            path = path.split('.');
            for (var i = 0; i < path.length; i++) {
                if (_.isNull(res)) return null;
                if (_.isEmpty(path[i])) continue;
                if (!_.isUndefined(res[path[i]])) res = res[path[i]];
            }
            return _.isObject(res) && !_.isArray(res) ? null : res;
        },
        keyPathSetter: function(obj, path, value) {
            path = path.split('.');
            while (path.length > 1) {
                if (!obj[path[0]]) obj[path[0]] = {};
                obj = obj[path.shift()];
            }
            obj[path.shift()] = value;
            return obj[path.shift()];
        },
        getComponentInstanceName: function() {
            var attrArr = this.field.get('name').split('.');
            var name = attrArr.shift();
            return name;
        },
        /* --------------------------------------- */



        /* --------- TODO: MOVE TO Collection Prototype ? -------- */
        initCollection: function(collectionConfigOptionName) {
            var name = this.getComponentInstanceName();
            if (!_.isUndefined(this.model.get(name))) {
                if (this.model.get(name) instanceof Backbone.Collection) {
                    this.collection = this.model.get(name);
                } else {
                    //not already in the form of a collection
                    this.collection = new Backbone.Collection(this.model.get(name));
                }
            } else {
                //not in model yet so use what is given in the config
                if (!(this.field.get(collectionConfigOptionName) instanceof Backbone.Collection)) {
                    this.collection = new Backbone.Collection(this.field.get(collectionConfigOptionName));
                } else {
                    this.collection = this.field.get(collectionConfigOptionName) || new Backbone.Collection();
                }
            }
        },
        mappedAttribute: function(attribute, handlebarSyntax, doubleQuotes) {
            var mappedAttribute = this.attributeMapping[attribute];

            if (handlebarSyntax) {
                mappedAttribute = '{{' + mappedAttribute + '}}';
            }

            if (doubleQuotes) {
                mappedAttribute = '"' + mappedAttribute + '"';
            }

            return mappedAttribute;
        },
        buildAttributeMappedArray: function(collection, customAttrMapping, defaultAttrMapping, defaultValueField) {
            customAttrMapping = _.defaults(customAttrMapping || {}, defaultAttrMapping);

            return collection.map(function(item) {
                var mappedItem = {};
                _.each(_.keys(defaultAttrMapping), function(aKey) {
                    mappedItem[aKey] = item.get(customAttrMapping[aKey]) || item.get(customAttrMapping[defaultValueField]);
                });

                return mappedItem;
            });
        },

        setBooleanFieldOption: function(attribute, booleanValue, e, options) {
            if (_.isBoolean(booleanValue)) {
                this.field.set(attribute, booleanValue, options || {});
            }
            e.stopPropagation();
        },
        setStringFieldOption: function(attribute, stringValue, e, options) {
            if (_.isString(stringValue)) {
                this.field.set(attribute, stringValue);
            }
            e.stopPropagation();
        },
        setIntegerFieldOption: function(attribute, intValue, e, options) {
                if (_.isNumber(intValue)) {
                    this.field.set(attribute, intValue, options || {});
                }
                e.stopPropagation();
            }
            /*
            ------ END OF SHARED BEHAVIOR CODE --------
            */
    };
});