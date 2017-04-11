define([
    'backbone',
    'handlebars',
    'main/ui_components/tabs/component',
    'main/ui_components/form/control/controlService',
    'main/ui_components/form/controls/container'
], function(
    Backbone,
    Handlebars,
    Tabs,
    ControlService,
    ContainerControl
) {
    'use strict';

    var TabsControl = ControlService.LayoutViewControl.extend({
        template: Handlebars.compile([
            '<div class="form-tabs-region"></div>'
        ].join('\n')),
        ui: {
            'FormTabsRegion': '.form-tabs-region'
        },
        regions: {
            'FormTabsRegion': '@ui.FormTabsRegion'
        },
        defaults: {
            tabs: [],
            extraClasses: []
        },
        requiredFields: ['tabs'],
        behaviors: _.defaults({
          NestableContainer: {
            behaviorClass: ControlService.Behaviors.NestableContainer
          }
        }, _.omit(ControlService.LayoutViewControl.prototype.behaviors, 'ErrorMessages')),
        initialize: function(options) {
            this.initOptions(options);
            this.setFormatter();
            this.listenToFieldName();
            this.listenToFieldOptions();

            var tabs = this.field.get("tabs");
            if (!(tabs instanceof Backbone.Collection)) {
                this.tabs = new Backbone.Collection(tabs);
            } else {
                this.tabs = tabs || new Backbone.Collection();
            }
            this.collection = this.tabs;

            this.collection.bind('change remove add reset', function() {
              var self = this;
              this.tabContent = _.map(this.collection.models, function(tab) {
                return {
                  label: tab.get('title'),
                  view: function() {
                    var containerField = new ControlService.Field({
                      control: "container",
                      items: tab.get('items')
                    });
                    return new ContainerControl({
                      field: containerField,
                      model: self.model
                    });
                  }()
                };
              }, this);
              this.render();
            }, this);
            var self = this;
            // for each tab, set the label and view, which is a container control
            // containing each control under the tab's items array
            this.tabContent = _.map(this.collection.models, function(tab) {
                return {
                    label: tab.get('title'),
                    view: function() {
                        var containerField = new ControlService.Field({
                            control: "container",
                            items: tab.get('items')
                        });
                        return new ContainerControl({
                            field: containerField,
                            model: self.model
                        });
                    }()
                };
            });
        },
        onRender: function() {
            this.showChildView("FormTabsRegion", new Tabs({
                tabs: this.tabContent
            }));
        }
    });

    return TabsControl;
});
