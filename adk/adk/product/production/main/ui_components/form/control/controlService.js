define([
    'backbone',
    'marionette',
    'main/ui_components/form/utils',
    'main/ui_components/form/classDefinitions',
    'main/ui_components/form/fieldsCollection',
    'main/ui_components/form/fieldModel',
    'main/ui_components/form/control/behaviors/bahaviors',
    'main/ui_components/form/control/formatters/default',
    'main/ui_components/form/control/formatters/json',
    'main/ui_components/form/control/prototype',
    'main/ui_components/form/control/containerPrototype',
    'main/ui_components/form/control/containerUtils',
    'main/ui_components/form/control/controlConstructor'
], function(
    Backbone,
    Marionette,
    Utils,
    ClassDefinitions,
    FieldsCollection,
    FieldModel,
    ControlBehaviors,
    DefaultFormatter,
    JSONFormatter,
    ControlPrototype,
    ContainerPrototype,
    ContainerUtils,
    ControlConstructor
) {
    "use strict";

    /* ----- START OF: Control View Definitions ----- */
    var OrigItemView = Backbone.Marionette.ItemView.extend(ControlPrototype);
    var ItemView = OrigItemView.extend({
        constructor: function(){
            ControlConstructor.apply(this, arguments);
            OrigItemView.prototype.constructor.apply(this, arguments);
        }
    });

    var OrigLayoutView = Backbone.Marionette.LayoutView.extend(ControlPrototype);
    OrigLayoutView = OrigLayoutView.extend({
        getComponentInstanceName: function() {
            var attrArr = this.field.get('name').split('.');
            return attrArr.shift();
        },
        getComponentInstanceNamePath: function() {
            var attrArr = this.field.get('name').split('.');
            var name = attrArr.shift();
            return attrArr.join('.');
        },
        getModelValue: function() {
            return !_.isEmpty(this.fieldConfigPath) && _.isObject(this.model.get(this.fieldConfigName)) ?
                this.keyPathAccessor(this.model.get(this.fieldConfigName), this.fieldConfigPath) :
                this.model.get(this.fieldConfigName);
        },
        setFieldName: function() {
            this.fieldConfigName = this.getComponentInstanceName();
        },
        setFieldNamePath: function() {
            this.fieldConfigPath = this.getComponentInstanceNamePath();
        }
    });
    var LayoutView = OrigLayoutView.extend({
        constructor: function(){
            ControlConstructor.apply(this, arguments);
            OrigLayoutView.prototype.constructor.apply(this, arguments);
        }
    });

    var OrigCollectionView = Backbone.Marionette.CollectionView.extend(ControlPrototype);
    OrigCollectionView = OrigCollectionView.extend(ContainerPrototype);
    var CollectionView  = OrigCollectionView.extend({
        constructor: function(){
            ControlConstructor.apply(this, arguments);
            OrigCollectionView.prototype.constructor.apply(this, arguments);
        }
    });

    var OrigCompositeView = Backbone.Marionette.CompositeView.extend(ControlPrototype);
    OrigCompositeView = OrigCompositeView.extend(ContainerPrototype);
    var CompositeView  = OrigCompositeView.extend({
        constructor: function(){
            ControlConstructor.apply(this, arguments);
            OrigCompositeView.prototype.constructor.apply(this, arguments);
        }
    });
    /* ------ END OF: Control View Definitions ------ */

    var ControlService = {};
    _.extend(ControlService, Utils, ClassDefinitions, ContainerUtils, {
        Behaviors: ControlBehaviors
    }, {
        /* Collection and Model Definitions */
        Fields: FieldsCollection,
        Field: FieldModel
    }, {
        /* Formatters */
        ControlFormatter: DefaultFormatter,
        JSONFormatter: JSONFormatter
    }, {
        /* Prototypes */
        CommonPrototype: ControlPrototype,
        ContainerPrototype: ContainerPrototype
    }, {
        /* View Definitions */
        Control: ItemView,
        LayoutViewControl: LayoutView,
        CollectionViewControl: CollectionView,
        CompositeViewControl: CompositeView
    });
    return ControlService;

});