define([
    "backbone",
    'jquery',
    'underscore',
    'backbone.paginator'
], function(Backbone, $, _, PageableCollection) {
    'use strict';

    var GROWTH_RATE = 100;


    // @private variables set in the backbone.pageable library
    var _extend = _.extend;
    var _clone = _.clone;
    var _each = _.each;
    var _keys = _.keys;
    var _isUndefined = _.isUndefined;
    var ceil = Math.ceil;


    /**
     * This is a copy of a private function used in the backbone pagable library
     */
    function runOnceAtLastHandler (col, event, func) {
        var eventHandlers = col._events[event];
        if (eventHandlers && eventHandlers.length) {
            var lastHandler = eventHandlers[eventHandlers.length - 1];
            var oldCallback = lastHandler.callback;
            lastHandler.callback = function () {
                try {
                    oldCallback.apply(this, arguments);
                    func();
                }
                catch (e) {
                    throw e;
                }
                finally {
                    lastHandler.callback = oldCallback;
                }
            };
        }
        else func();
    }


    return Backbone.PageableCollection.extend({

        /**
         * Check to see if we are using our client side infinite scrolling
         * @param bool {Boolean}
         */
        setClientInfinite: function (bool) {
            this.isClientInfinite = bool;
        },

        /**
         * @override
         * @change: Sets the client isClientInfinite
         */
        constructor: function (options) {
            Backbone.PageableCollection.apply(this, arguments);
            this.setClientInfinite(options.isClientInfinite || false);
        },

        /**
         * @override
         * @change: Runs custom function if isClientInfinite
         */
        getNextPage: function (options) {
            if(this.isClientInfinite) return this._appendPage(options);
            else return this.getPage("next", options);
        },

        /**
         * Moves moves from the 'fullCollection' to the model without calling reset
         * @private
         */
        _appendPage: function(options) {
            options = options || {};
            var fullCollection = this.fullCollection;
            var appendStart = this.models.length;
            var models = fullCollection.models.slice(appendStart, appendStart + GROWTH_RATE);
            this.add(models, options);
        },


        /**
         * This is the same as the source code except for one line that had to be altered
         * @override
         * @change: Blocks part of the code on isClientInfinite
         */
        _makeCollectionEventHandler: function (pageCol, fullCol) {

            return function collectionEventHandler (event, model, collection, options) {

                var handlers = pageCol._handlers;
                _each(_keys(handlers), function (event) {
                    var handler = handlers[event];
                    pageCol.off(event, handler);
                    fullCol.off(event, handler);
                });

                var state = _clone(pageCol.state);
                var firstPage = state.firstPage;
                var currentPage = firstPage === 0 ?
                    state.currentPage :
                state.currentPage - 1;
                var pageSize = state.pageSize;
                var pageStart = currentPage * pageSize, pageEnd = pageStart + pageSize;


                // @change: Do not run this if isClientInfinite
                if (event === "add" && !pageCol.isClientInfinite) {
                    var pageIndex, fullIndex, addAt, colToAdd;
                    if(options === undefined){
                        options = {};
                    }
                    if (collection === fullCol) {
                        fullIndex = fullCol.indexOf(model);
                        if (fullIndex >= pageStart && fullIndex < pageEnd) {
                            colToAdd = pageCol;
                            pageIndex = addAt = fullIndex - pageStart;
                        }
                    }
                    else {
                        pageIndex = pageCol.indexOf(model);
                        fullIndex = pageStart + pageIndex;
                        colToAdd = fullCol;
                        addAt = !_isUndefined(options.at) ?
                        options.at + pageStart :
                            fullIndex;
                    }

                    if (!options.onRemove) {
                        ++state.totalRecords;
                        delete options.onRemove;
                    }

                    pageCol.state = pageCol._checkState(state);

                    if (colToAdd) {
                        colToAdd.add(model, _extend({}, options || {}, {at: addAt}));
                        var modelToRemove = pageIndex >= pageSize ?
                            model :
                            !_isUndefined(options.at) && addAt < pageEnd && pageCol.length > pageSize ?
                                pageCol.at(pageSize) :
                                null;
                        if (modelToRemove) {
                            runOnceAtLastHandler(collection, event, function () {
                                pageCol.remove(modelToRemove, {onAdd: true});
                            });
                        }
                    }
                }

                // remove the model from the other collection as well
                if (event === "remove") {
                    if (!options.onAdd) {
                        // decrement totalRecords and update totalPages and lastPage
                        if (!--state.totalRecords) {
                            state.totalRecords = null;
                            state.totalPages = null;
                        }
                        else {
                            var totalPages = state.totalPages = ceil(state.totalRecords / pageSize);
                            state.lastPage = firstPage === 0 ? totalPages - 1 : totalPages || firstPage;
                            if (state.currentPage > totalPages) state.currentPage = state.lastPage;
                        }
                        pageCol.state = pageCol._checkState(state);

                        var nextModel, removedIndex = options.index;
                        if (collection === pageCol) {
                            nextModel = fullCol.at(pageEnd);
                            if (nextModel) {
                                runOnceAtLastHandler(pageCol, event, function () {
                                    pageCol.push(nextModel, {onRemove: true});
                                });
                            }
                            fullCol.remove(model);
                        }
                        else if (removedIndex >= pageStart && removedIndex < pageEnd) {
                            nextModel = fullCol.at(pageEnd - 1);
                            if (nextModel) {
                                runOnceAtLastHandler(pageCol, event, function() {
                                    pageCol.push(nextModel, {onRemove: true});
                                });
                            }
                            pageCol.remove(model);
                        }
                    }
                    else delete options.onAdd;
                }

                if (event === "reset") {
                    options = collection;
                    collection = model;

                    // Reset that's not a result of getPage
                    if (collection === pageCol && options.from === null &&
                        options.to === null) {
                        var head = fullCol.models.slice(0, pageStart);
                        var tail = fullCol.models.slice(pageStart + pageCol.models.length);
                        fullCol.reset(head.concat(pageCol.models).concat(tail), options);
                    }
                    else if (collection === fullCol) {
                        if (!(state.totalRecords = fullCol.models.length)) {
                            state.totalRecords = null;
                            state.totalPages = null;
                        }
                        if (pageCol.mode === "client") {
                            state.lastPage = state.currentPage = state.firstPage;
                        }
                        pageCol.state = pageCol._checkState(state);
                        pageCol.reset(fullCol.models.slice(pageStart, pageEnd),
                            _extend({}, options, {parse: false}));
                    }
                }

                if (event === "sort") {
                    options = collection;
                    collection = model;
                    if (collection === fullCol) {
                        pageCol.reset(fullCol.models.slice(pageStart, pageEnd),
                            _extend({}, options, {parse: false}));
                    }
                }

                _each(_keys(handlers), function (event) {
                    var handler = handlers[event];
                    _each([pageCol, fullCol], function (col) {
                        col.on(event, handler);
                        var callbacks = col._events[event] || [];
                        callbacks.unshift(callbacks.pop());
                    });
                });
            };
        }
    });
});

