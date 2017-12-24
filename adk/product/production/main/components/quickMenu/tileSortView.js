define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    'use strict';

    var LEFT_CLICK = 1;
    var KEYS = {
        SPACE: 13,
        ENTER: 32,
        UP: 38,
        UP_PAD: 87,
        DOWN: 40,
        DOWN_PAD: 90

    };

    return Marionette.ItemView.extend({
        tagName: 'button',
        attributes: {
            'role': 'application'
        },
        className: 'btn btn-xs btn-default tilesort-keydown-dragging tilesort-button',
        template: Handlebars.compile('<i class="fa fa-arrows-v"></i>'),

        events: {
            click: 'activateTitleSort',
            keydown: 'activateTitleSort',
            focusout: 'finalize'
        },

        eventKey: null,

        constants: {
            draggingRow: 'dragging-row'
        },

        spanTemplate: Handlebars.compile('<span class="sr-only"> {{text}} </span>'),

        complete: false,

        onRender: function() {
            var $row = this.getRowElement();
            var $parent = $row.parent();
            this.placeholder = $parent.find('.placeholder').detach();

            var instanceId = $row.find('[data-cell-tilesort]').text().trim();
            var spanText = 'activated for ' + instanceId +
                ' tile. Use the up or down arrow keys to move the tile, then press enter again to set tile';

            this.appendSpan(spanText);

            $row.trigger('quicklooks:disable:all');
            $row.addClass(this.constants.draggingRow);
            $row.trigger('dragstart');
        },

        onDomRefresh: function() {
            this.$el.focus();
        },

        finalize: function() {
            if (!this.isArrowKey() && !this.complete) {
                this.complete = true;
                var $row = this.getRowElement();
                var $parent = $row.parent();

                var spanText = this.enterPressed();

                $row.trigger('quicklooks:enable:all');

                this.appendSpan(spanText);
                $parent.append(this.placeholder);
                this.destroy();
            }
        },

        /**
         * Default function for click and keyboard input
         * @param event DOM event
         */
        activateTitleSort: function activateTitleSort(event) {
            event.preventDefault();
            event.stopPropagation();

            this.eventKey = event.which;

            if (this.isPrimaryKey()) {
                this.finalize();
            } else if (this.isArrowKey()) {
                var spanText = this.isUpArrow() ? this.upPressed() : this.downPressed();
                this.appendSpan(spanText);
            }

            var $row = this.getRowElement();
            $row.focus();
            this.$el.focus();

            this.eventKey = null;
        },

        /**
         * @return {boolean} True if the key pressed is space/enter/left click
         */
        isPrimaryKey: function isPrimaryKey() {
            var finishedKeys = [KEYS.ENTER, KEYS.SPACE, LEFT_CLICK];
            return _.contains(finishedKeys, this.eventKey);
        },

        /**
         * @return {boolean} True if the key pressed is an arrow key
         */
        isArrowKey: function isArrowKey() {
            var arrowKeys = [KEYS.UP, KEYS.UP_PAD, KEYS.DOWN, KEYS.DOWN_PAD];
            return _.contains(arrowKeys, this.eventKey);
        },

        /**
         * @return {boolean} True if the key pressed is an up arrow key
         */
        isUpArrow: function isUpArrow() {
            return this.eventKey === KEYS.UP || this.eventKey === KEYS.UP_PAD;
        },

        /**
         * Adds a screen reader span to the button view
         * @param {string} text The text for the screen reader to read
         */
        appendSpan: function appendSpan(text) {
            this.$el.find('.sr-only').remove();
            var $html = this.spanTemplate({text: text});
            this.$el.append($html);
        },

        /**
         * Returns the row element.
         */
        getRowElement: function getRowElement() {
            return _.get(this, 'options.targetView.$el');
        },

        /**
         * Called when the up arrow is pressed
         * @return {string} The text for the screen reader
         */
        upPressed: function upPressed() {
            var $row = this.getRowElement();
            var $prev = $row.prevAll('.gist-item:first');

            if ($prev.length) {
                var instanceId = $prev.find('[data-cell-tilesort]').text().trim();
                $prev.before($row);
                return 'Current tile moved above the ' + instanceId + ' tile';
            }
            return 'Beginning of list';
        },

        /**
         * Called when the down arrow is pressed
         * @return {string} The text for the screen reader
         */
        downPressed: function downPressed() {
            var $row = this.getRowElement();
            var $next = $row.nextAll('.gist-item:first');

            if ($next.length) {
                var instanceId = $next.find('[data-cell-tilesort]').text().trim();
                $next.after($row);
                return 'Current tile moved below the ' + instanceId + ' tile';
            }
            return 'End of list.';
        },

        /**
         * Called when enter, space, or left click is pressed
         * @return {string} The text for the screen reader
         */
        enterPressed: function enterPressed() {
            var $row = this.getRowElement();
            var instanceId = $row.find('[data-cell-tilesort]').text().trim();

            $row.removeClass(this.constants.draggingRow);
            $row.trigger('drop');
            return instanceId + ' tile was successfully set';
        },

        onDestroy: function onDestroy() {
            this.eventKey = null;
            var $row = this.getRowElement();
            $row.removeClass(this.constants.draggingRow);
        }
    });
});