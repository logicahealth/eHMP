define([
    'main/resources/abstract',
    'api/Messaging',
    'api/UrlBuilder',
    'api/PatientRecordService',
    'api/UserService'
], function(Abstract, Messaging, UrlBuilder, PatientRecordService, UserService) {
    "use strict";

    var AbstractCollection = Abstract.Collection.extend({
        model: ModifiedGroup,
        resource: 'write-pick-list',
        parse: function(resp, options) {
            return resp.data;
        },
        findWhere: function(attrs) {
            var found;
            this.find(function(model) {
                found = model.findWhere(attrs) || this.where(attrs, true);
                return found; //break loop
            }, this);
            return found;
        },
        toPicklist: function(options) {
            return this.map(function(model) {
                return model.toPicklist(options);
            });
        }
    });


    var PicklistCollection = AbstractCollection,
        ModifiedCollection = PicklistCollection.extend({
            constructor: function() {
                this.user = UserService.getUserSession();
                if (_.isUndefined(this.user.get('duz'))) {
                    throw new Error('No user has logged in.  Resource collection cannot be instanted without user data available.');
                }
                this.patient = PatientRecordService.getCurrentPatient();
                if (_.isUndefined(this.patient.get('pid'))) {
                    throw new Error('No patient has been selected.  Resource collection cannot be instanted without patient data available.');
                }

                this.defaultParams = _.extend({
                    type: this.type,
                    site: this.user.get('site')
                }, _.isFunction(this.defaultParams) ? this.defaultParams.apply(this, arguments) : this.defaultParams || {});

                _.each(this.resourceEvents, function(val, key) {
                    this.listenTo(this, key, (_.isFunction(val)) ? val : this[val]);
                }, this);

                PicklistCollection.prototype.constructor.apply(this, arguments);
            }
        });

    //this is when a pick list uses a group
    //this model will contain a collection of models
    var AbstractGroup = Abstract.Model.extend({
        picklist: undefined, //required--attribute that contains an array which will be made into a collection
        groupLabel: undefined, //required--label for group
        toPicklist: function(options) {
            var attrs = {},
                item = this.get(this.picklist),
                picklist = (_.isFunction(item.clone)) ? item.clone(): _.clone(item);
            attrs.group = this.get(this.groupLabel);
            attrs.pickList = (_.isObject(picklist) && _.isFunction(picklist.toPicklist)) ? picklist.toPicklist(options) : [];
            return attrs;
        },
        findWhere: function(attrs) {
            var picklist = this.get(this.picklist);
            if (!_.isObject(picklist) || !_.isFunction(picklist.findWhere)) return void 0;
            var found = picklist.findWhere(attrs);
            if (found) return found;
            found = this;
            _.each(attrs, function(val, key) {
                if (this.get(key) !== val) {
                    found = void 0; //set to undefined
                }
            }, this);
            return found;
        }
    });


    var PicklistGroup = AbstractGroup,
        ModifiedGroup = PicklistGroup.extend({
            constructor: function() {
                if (_.isUndefined(this.picklist)) {
                    throw new Error('The "picklist" parameter must be defined.');
                }
                if (_.isUndefined(this.groupLabel)) {
                    throw new Error('The "groupLabel" parameter must be defined.');
                }

                this.childAttributes = [this.picklist];
                if (this.Collection.prototype.parse === ModifiedCollection.prototype.parse) {
                    this.Collection = this.Collection.extend({
                        parse: Backbone.Collection.prototype.parse
                    });
                }

                PicklistGroup.prototype.constructor.apply(this, arguments);
            }
        });

    //this is he actual picklist items
    var AbstractModel = Abstract.Model.extend({
        //there are cases when label selection isn't cut and dry, as such there are three ways
        /*
        label: 'someattribute',
        label: function(options) {
            if (this.get('someAttribute') == 'someString') return 'label';
            return 'someAttribute';
        },
        label: {
            defaultLabel: 'someattribute',
            filters: [{
                //any number of conditions...
                //if this.get('attributeName') === 'someString'
                //return this.get('someAttributeOrString') || 'someAttributeOrString'
                'attributeName': 'someString',
                'anotherAttributeName': 'someString',
                //if all of these attributes equal the corresponding string
                //then set the label to this.get('someAttributeOrString')
                //or if that attribute doesn't exist, set the label directly to 'someAttibuteOrString'
                'label': 'someAttributeOrString'
            }]
        },
        */
        toPicklist: function(options) {
            var attrs = {},
                model = this,
                label;

            //remember that the business end of label needs to be an attribute name or a string
            //if the attribute can't be found it's a string
            //if the attribute exists that attribute becomes label
            //if the label is an object, it's a filter, and a set of conditions have to be met,
            //to determine which set of criteria make the label, otherwise it's set to defaultLabel,
            //and again it can be a model lookup or a string
            if (_.isFunction(this.label)) {
                label = this.label.apply(this, arguments);
            } else if (_.isObject(this.label)) {
                var conditionalLabel = _.where(this.label.filters, function(item) {
                    var found = true,
                        foundLabel = false;
                    _.each(item, function(val, key) {
                        if (key === 'label') {
                            foundLabel = true;
                        } else {
                            if (_.isFunction(val)) return val.call(model, key);
                            if (model.get(key) !== val) found = false;
                        }
                    }, this);
                    if (!foundLabel) {
                        throw new Error([
                            'No label field specified in conditional label configuration.',
                            'Model.label must be [{\'label\':\'attribute_key\',\'conditional_attribute_key\':\'string_to_equal\'}]'
                        ].join('\r\n'));
                    }
                    return found;
                });
                label = (!_.isEmpty(conditionalLabel)) ? conditionalLabel[0].label : this.label.defaultLabel;
            } else {
                label = this.label;
            }

            if (_.isFunction(label)) label = label.apply(this, arguments);

            attrs.label = this.get(label) || label;
            attrs.value = (_.isFunction(this.value)) ? this.value() : this.value;
            attrs.value = this.get(attrs.value) || attrs.value;
            return attrs;
        },
        value: 'cid',
        findWhere: function(attrs) {
            var found = this;
            _.each(attrs, function(val, key) {
                if (this.get(key) !== val) {
                    found = void 0; //undefined
                }
            }, this);
            return found;
        }
    });


    var PicklistModel = AbstractModel,
        ModifiedModel = PicklistModel.extend({
            constructor: function() {
                if (_.isUndefined(this.label)) {
                    throw new Error('The "label" parameter must be defined.');
                }

                PicklistModel.prototype.constructor.apply(this, arguments);

                //if the user hasn't specified a primary key, set one in the model data
                //so that search can be performed against the collection
                //collection.findWhere({cid: 'someCid'})
                if (this.value === PicklistModel.prototype.value) {
                    this.set('cid', this.cid);
                }
            }
        });

    return {
        Collection: ModifiedCollection,
        Group: ModifiedGroup,
        Model: ModifiedModel
    };

});