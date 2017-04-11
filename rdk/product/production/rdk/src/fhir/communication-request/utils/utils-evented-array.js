'use strict';
var _ = require('lodash');

//subclassing the array in order to attach events
//http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#why_subclass_an_array


function EvtArray() {
    var arr = [];
    arr.push.apply(arr, arguments);
    //I am not aware of any better method to do this
    /* jshint ignore:start */
    arr.__proto__ = EvtArray.prototype;
    /* jshint ignore:end */
    arr._listeners = {};
    return arr;
}
EvtArray.prototype = [];
EvtArray.prototype.addListenerOnce = function(type, listener, options) {
    if (_.isUndefined(this._listeners[type])) {
        this._listeners[type] = [];
    }
    options.once = true;
    this._listeners[type].push({
        listener: listener,
        options: options
    });
};
EvtArray.prototype.fire = function(event) {
    if (_.isString(event)) {
        event = {
            type: event
        };
    }
    if (_.isUndefined(event.target)) {
        event.target = this;
    }

    if (!event.type) { //falsy
        return new Error('Event object missing type property.');
    }

    if (this._listeners[event.type] instanceof Array) {
        var listeners = this._listeners[event.type];
        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i].listener.call(this, null, event);
        }
        //remove the 'once' listeners
        _.remove(listeners, function(item) {
            return item.options.once;
        });
    }
    return;

};

module.exports = EvtArray;
