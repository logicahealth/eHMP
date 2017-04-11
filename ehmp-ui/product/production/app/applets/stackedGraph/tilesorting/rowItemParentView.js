define([
    'backbone',
    'marionette',
    'underscore',
], function(Backbone, Marionette, _) {
    "use strict";

    var dragged;
    var TileSortRowItemView = Backbone.Marionette.ItemView.extend({
        behaviors: {
            FloatingToolbar: {
                DialogContainer: '.toolbar-container'
            }
        },
        ui: {
            popoverEl: '[data-toggle=popover]',
            toolbarToggler: '.selectable:not([data-toggle=popover])'
        },
        events: {
            'dragstart': function(event) {
                var index = $(this.el).parent().find('.row').index(this.el);
                if(event.originalEvent){
                    dragged = event.currentTarget;
                    // IE requires the first parameter to be text or URL. You can't give it a custom name.
                    event.originalEvent.dataTransfer.setData('text', index);
                } else {
                    this.performManualDragStart(index);
                }
            },
            'dragover': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                dragged.style.display = 'none';

                if(event.target.className === 'placeholder-tile-sort') return;

                var placeholder = $(this.el).parent().find('.placeholder-tile-sort');
                $(placeholder).removeClass('hidden');
                if($(this.el).index() === 1){
                    $(placeholder).insertBefore($(this.el));
                }else {
                    $(placeholder).insertAfter($(this.el));
                }
            },
            'drop': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                var originalIndex = Number(this.manualOriginalIndex);
                var targetIndex = $(this.el).parent().find('.row').index(this.el);
                var reorder = {
                    oldIndex: originalIndex,
                    newIndex: targetIndex
                };
                $(this.el).trigger('reorder', reorder);
            },
            'dragend': function (event) {
                // Handle when dropped outside of placeholder
                event.preventDefault();
                $(this.el).parent().parent().find('.placeholder-tile-sort').addClass('hidden');
                dragged.style.display = 'block';
            }
        },
        initialize: function() {
            if (_.result(_.get(this, 'toolbarOptions'), 'buttonTypes') && !_.get(ADK.Messaging.request('get:current:screen'), 'config.predefined')) {
                this.toolbarOptions.buttonTypes.unshift('tilesortbutton');
                this.toolbarOptions.isStackedGraph = true;
            }
        },
        onRender: function(){
            var currentScreen = ADK.Messaging.request('get:current:screen');
            var isUserWorkspace = !(currentScreen.config.predefined);
            this.$el.attr('draggable', isUserWorkspace);

            if(!isUserWorkspace) {
                $(this.el).unbind('dragstart');
                $(this.el).unbind('drop');
                $(this.el).unbind('dragover');
            }
        },
        performManualDragStart: function(originalIndex){
            this.manualOriginalIndex = originalIndex;
        },
        onDestroy: function(){
            this.ui.popoverEl.popup('destroy');
        },
        createPopover: function() {
            this.ui.popoverEl.popup({
                trigger: 'click',
                html: 'true',
                container: 'body',
                template: popoverTemplate(this.model),
                placement: 'bottom',
                referenceEl: this.$el
            });
        }
    });

    TileSortRowItemView.extend = function(child) {
        var view = Backbone.Marionette.LayoutView.extend.apply(this, arguments);

        if(typeof this.prototype.events == 'function'){
            view.prototype.events = _.extend({}, this.prototype.events(), child.events);
        } else {
            view.prototype.events = _.extend({}, this.prototype.events, child.events);
        }
        return view;
    };

    return TileSortRowItemView;
});
