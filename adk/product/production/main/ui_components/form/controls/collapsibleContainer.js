define([
  'backbone',
  'handlebars',
  'main/ui_components/collapsible_container/component',
  'main/ui_components/form/control/controlService',
  'main/ui_components/form/controls/container'
], function(
  Backbone,
  Handlebars,
  CollapsibleContainer,
  ControlService,
  ContainerControl
) {
  'use strict';

  return ControlService.LayoutViewControl.extend(_.extend({
    behaviors: _.defaults({
      NestableContainer: {
        behaviorClass: ControlService.Behaviors.NestableContainer
      }
    }, _.omit(ControlService.LayoutViewControl.prototype.behaviors, 'ErrorMessages')),
    template: Handlebars.compile(
      '<div class="form-collapsible-container-region"/>'
    ),
    ui: {
      'FormCollapsibleContainerRegion': '.form-collapsible-container-region'
    },
    regions: {
      'FormCollapsibleContainerRegion': '@ui.FormCollapsibleContainerRegion'
    },
    defaults: {
      name: '',
      extraClasses: [],
      headerItems: [],
      collapseItems: []
    },
    requiredFields: ['name'],
    buildCollections: function(headerItems, collapseItems) {
      if (!(headerItems instanceof Backbone.Collection)) {
        this.headerItems = new ControlService.Fields(headerItems);
      } else {
        this.headerItems = headerItems;
      }

      if (!(collapseItems instanceof Backbone.Collection)) {
        this.collapseItems = new ControlService.Fields(collapseItems);
      } else {
        this.collapseItems = collapseItems;
      }

      var headerObj = {
        items: _.flatten(_.reduce(this.headerItems.models, function(arr, model) {
          arr.push(model.attributes);
          return arr;
        }, [], this)),
        name: 'headerItemsList'
      };
      var collapseObj = {
        items: _.flatten(_.reduce(this.collapseItems.models, function(arr, model) {
          arr.push(model.attributes);
          return arr;
        }, [], this)),
        name: 'collapseItemsList'
      };

      var self = this;
      _.each([headerObj, collapseObj], function(obj) {
        this[obj.name] = {
          label: obj.name,
          view: function() {
            var containerField = new ControlService.Field({
              control: 'container',
              items: obj.items,
              extraClasses: ["row"]
            });

            return new ContainerControl({
              field: containerField,
              model: self.model
            });
          }()
        };
      }, this);

    },
    initialize: function(options) {
      this.collection = new Backbone.Collection();
      this.initOptions(options);
      this.setFormatter();
      this.listenToFieldName();
      this.options = options;
      var header = options.field.get('headerItems') || [];
      var collapse = options.field.get('collapseItems') || [];
      this.buildCollections(header, collapse);
      this.headerItems.on('change reset add remove', function() {
        this.buildCollections(this.headerItems, this.collapseItems);
        this.render();
      }, this);
      this.collapseItems.on('change reset add remove', function() {
        this.buildCollections(this.headerItems, this.collapseItems);
        this.render();
      }, this);
    },
    onRender: function() {
      this.showChildView('FormCollapsibleContainerRegion', new CollapsibleContainer({
        name: this.field.get('name'),
        headerItems: {
          name: this.headerItemsList.label,
          view: this.headerItemsList.view
        },
        collapseItems: {
          name: this.collapseItemsList.label,
          view: this.collapseItemsList.view
        }
      }));
    },
    events: _.defaults({
      'control:collapsed': function(event, booleanValue) {
        if (_.isBoolean(booleanValue)) {
          var showOrHideString = booleanValue ? 'hide' : 'show';
          if (booleanValue) {
            this.$el.find('[data-buttonid="collapsibleContainerTrigger"]').addClass('collapsed');
          } else {
            this.$el.find('[data-buttonid="collapsibleContainerTrigger"]').removeClass('collapsed');
          }

          this.$el.find('.collapsible-container-collapse-region > .collapse-content').collapse(showOrHideString);
        }
      },
      'control:headerItems:add': function(event, model) {
        this.addModel('headerItems', model, event);
      },
      'control:headerItems:remove': function(event, model) {
        this.removeModel('headerItems', model, event);
      },
      'control:headerItems:update': function(event, model) {
        this.updateCollection('headerItems', model, event);
      },
      'control:collapseItems:add': function(event, model) {
        this.addModel('collapseItems', model, event);
      },
      'control:collapseItems:remove': function(event, model) {
        this.removeModel('collapseItems', model, event);
      },
      'control:collapseItems:update': function(event, model) {
        this.updateCollection('collapseItems', model, event);
      },
      'control:collapsibleContainer:disableButton': function(event, booleanValue) {
        if (_.isBoolean(booleanValue)) {
          var disableString = booleanValue ? 'disabled' : '';
          this.$el.find("data-buttonid='collapsibleContainerTrigger'").prop('disabled', disableString);
        }
      }
    }, _.omit(ControlService.LayoutViewControl.prototype.behaviors, 'UpdateConfig'))
  }, _.pick(ControlService, ['addModel', 'removeModel', 'updateCollection'])));
});