define([], function () {
    /**
     * A module that provides helper methods for the CDS Advice applet views.
     * @module cds_advice/util
     */
    'use strict';

    var Util = {};

    var ADVICE_TYPE = {
        REMINDER: 'reminder',
        ADVICE: 'advice',
        PROPOSAL: 'proposal'
    };

    var TYPE_MAP = {};
    TYPE_MAP[ADVICE_TYPE.REMINDER] = 'Reminder';
    TYPE_MAP[ADVICE_TYPE.ADVICE] = 'Advice';
    TYPE_MAP[ADVICE_TYPE.PROPOSAL] = 'Proposal';

    /**
     * Returns a CSS class name based on the priority. This allows color coding priority levels.
     *
     * @param {number} priority The advice object's priority code.
     * @return {string} A CSS class name corresponding to the priority.
     */
    Util.getPriorityCSS = function (priority) {
        return priority > 80 ? 'color-red bold-font' : '';
    };

    Util.formatDetailText = function (detailText){
        return detailText.replace(/[ ]+/g, ' ');
    };

    /**
     * Advice Type 'constants'. This mitigates typos.
     *
     */
    Util.ADVICE_TYPE = ADVICE_TYPE;

    return Util;
});
