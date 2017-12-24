define([
    'backbone',
    'underscore'
], function(Backbone, _) {
    'use strict';

    /**
     * @class IndividualModel
     * @feature 1285
     * @specification https://wiki.vistacore.us/x/o4igAQ
     * @description Used to hold the data for a single permission
     * @example {
     *   "uid": "access-general-ehmp",
     *   "value": "access-general-ehmp",
     *   "label": "eHMP General Access",
     *   "description": "Ability to perform application specific actions as an authenticated eHMP user such as set user preferences",
     *   "example": "",
     *   "note": "",
     *   "version": {
     *     "introduced": "2.0",
     *     "deprecated": null,
     *     "startAt": "2.0.0",
     *     "endAt": "2.3.4"
     *   },
     *   "status": "active",
     *   "nationalAccess": "false",
     *   "createdDateTime": <YYYYMMDDHHmmss>
     * }
     * @property {Object} _display Used to hold formatting functions called by the display method.
     * @property {String} idAttribute Set the the uid for fast look up
     */
    var IndividualModel = Backbone.Model.extend({
        idAttribute: 'uid',

        /**
         * Standard Backbone Parse function
         * @param {Object} response A single item from collection
         * @return {Object} The data formatted for this model.
         */
        parse: function parse(response) {
            if (response.createdDateTime) {
                response.createdOn = new ADK.utils.dateUtils.StringFormatter(response.createdDateTime).format('MM/DD/YYYY');
            }
            return response;
        },

        _display: {
            /**
             * A function to control formatting before render
             * @return {String} version.deprecated
             */
            'deprecated': function deprecated() {
                var version = this.get('version');
                var value = _.get(version, 'deprecated');
                return _.isNull(value) ? 'N/A' : value;
            },

            /**
             * A function to control formatting before render
             * @return {String} version.introduced
             */
            'introduced': function introduced() {
                var version = this.get('version');
                return _.get(version, 'introduced');
            },

            /**
             * A function to control formatting before render
             * @return {String} version.startsAt
             */
            'starts': function starts() {
                var version = this.get('version');
                return _.get(version, 'startsAt');
            },

            /**
             * A function to control formatting before render
             * @return {String} version.endsAt
             */
            'ends': function ends() {
                var version = this.get('version');
                return _.get(version, 'endsAt');
            },

            /**
             * A function to control formatting before render
             * @return {string} Yes if nationalAccess true otherwise No
             */
            'nationalAccess': function nationalAccess() {
                return this.get('nationalAccess') ? 'Yes' : 'No';
            }
        },

        /**
         * Helper function to get the formatted version of the model data
         * @param {String} key The model key for the item you intend to display
         * @return {String} Formatted version of the display item
         */
        display: function display(key) {
            var value;
            if (_.has(this._display, key)) {
                value = _.get(this._display, key).call(this);
            } else {
                value = this.get(key);
            }
            if (_.isString(value)) {
                value = _.unescape(value);
                value = _.escape(value);
            }
            return value;
        }
    });

    return IndividualModel;
});