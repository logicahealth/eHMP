define([
    'backbone'
], function(
    Backbone
) {
    "use strict";

    return {
        initCollection: function(collectionConfigOptionName) {
            collectionConfigOptionName = _.isString(collectionConfigOptionName) ?  collectionConfigOptionName : 'collection';
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
        }
    };
});