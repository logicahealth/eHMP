'use strict';
var EvtArray = require('./utils-evented-array');
var _ = require('lodash');


describe('When instantiating EvtArray class', function() {
    var listener, type, queue;
    listener = function() {
        return true;
    };
    type = 'type1';
    queue = new EvtArray();

    it('the object should be EvtArray', function() {
        expect(queue).to.be.an(EvtArray);
    });
    it('you should be able to add a listener function', function() {
        queue.addListenerOnce(type, listener, {});
        _.each(queue._listeners[type], function(item) {
            expect(item.listener).to.be.function();
        });
    });
    it('once fired there should be no more listeners', function() {
        queue.fire({
            'type': type
        });
        expect(queue.listeners).to.be.undefined();
    });
});
