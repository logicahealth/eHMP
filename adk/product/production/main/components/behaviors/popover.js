define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var Popover = Backbone.Marionette.Behavior.extend({
        ui: {
            '$popover': '[data-toggle=popover]'
        },
        onRender: function() {
            _.each(this.ui.$popover, function(popover) {
                var $popover = $(popover);
                if ($popover.data('bs.popover')) return;
                $popover.popover(_.defaults({}, this.options));
            }, this);
        },
        onBeforeDestroy: function() {
            this.removePopoverEvents();
            this.ui.$popover.popover('destroy');
        },
        removePopoverEvents: function(id, e) {
            if (this.getOption('interactivePopover')) {
                if (id) {
                    //being called from eventing and not from view's destroy mechanism
                    $(document).off('focusin.' + this.cid + '.popover.' + id);
                    $(document).off('click.' + this.cid + '.popover.' + id);
                    $(document).off('keydown.' + this.cid + '.popover.' + id);
                    this.$(e.target).data('bs.popover').inState.click = false;
                } else {
                    $(document).off('focusin.' + this.cid + '.popover');
                    $(document).off('click.' + this.cid + '.popover');
                    $(document).off('keydown.' + this.cid + '.popover');
                }
            }
        },
        events: function() {
            var events = {
                'keydown @ui.$popover': function(e) {
                    if (e.which === 27) this.$(e.target).popover('hide');
                }
            };
            if (!this.getOption('interactivePopover')) return events;

            events['shown.bs.popover @ui.$popover'] = function(e) {
                //get the selector to the popover container appended to body
                var popoverId = this.$(e.target).attr('aria-describedby');
                var popoverContainerSelector = '#' + popoverId;

                //listen for keydown, but namaespace it so we know it's unique for our needs
                $(document).on('keydown.' + this.cid + '.popover.' + popoverId, popoverContainerSelector, _.bind(function(popoverTrigger, ev) {
                    if (ev.which === 27) popoverTrigger.popover('hide');
                }, this, this.$(e.target)));

                //we want to see focusin hit an element outside our container rather
                //than focusout which fires if you were to select another OS window, such as the dev tools if detached
                var clickAndFocusHandler = _.bind(function(popoverTrigger, popoverContainer, ev) {
                    //we have to make sure our target is not inside our popover container, and not equal to it
                    if (popoverContainer[0] !== ev.target && !popoverContainer.find(ev.target).length) popoverTrigger.popover('hide');
                }, this, this.$(e.target), $(popoverContainerSelector));

                $(document).on('focusin.' + this.cid + '.popover.' + popoverId, 'body', clickAndFocusHandler);
                $(document).on('click.' + this.cid + '.popover.' + popoverId, 'body', clickAndFocusHandler);

                this.$(e.target).one('hidden.bs.popover', _.bind(this.removePopoverEvents, this, popoverId));
            };
            return events;
        }
    });

    return Popover;
});