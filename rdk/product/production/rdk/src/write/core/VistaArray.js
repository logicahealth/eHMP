'use strict';

var _ = require('lodash');

function VistaArray() {
    if (!this instanceof VistaArray) {
        return new VistaArray();
    }

    this.array = [];

}

VistaArray.prototype = {
    constructor: VistaArray,

    push: function(item) {
        this.array.push(item.toString());
    },
    toString: function() {
        var retString = '';
        _.each(this.array, function(element, index) {
            if (index === 0) {
                retString = element;
            } else {
                retString += '^' + element;
            }
        });
        return retString;
    }
};

module.exports.VistaArray = VistaArray;
