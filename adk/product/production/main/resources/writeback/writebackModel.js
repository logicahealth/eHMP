define([
    'main/resources/abstract',
    'api/Messaging',
    'api/PatientRecordService',
    'api/UserService'
], function(Abstract, Messaging, PatientRecordService, UserService) {
    "use strict";

    var wrapError = function(model, options) {
        var error = options.error;
        options.error = function(resp) {
            if (error) error.call(options.context, model, resp, options);
            model.trigger('error', model, resp, options);
        };
    };


    //IMPORTANT NOTE:  Model.destroy attempts to remove it from the server--it is a delete, not a freeing of memory
    var AbstractModel = Abstract.Model.extend({
        url: undefined,
        initialize: function() {
            //keep a pointer to the logged in user
            this.user = UserService.getUserSession();
            if (_.isUndefined(this.user.get('duz'))) {
                throw new Error('No user has logged in.  Resource model cannot be instanted without user data available.');
            }

            //keep a pointer to the logged in patient
            this.patient = PatientRecordService.getCurrentPatient();
            if (_.isUndefined(this.patient.get('pid'))) {
                throw new Error('No patient has been selected.  Resource model cannot be instanted without patient data available.');
            }

            _.each(this.resourceEvents, function(val, key) {
                this.listenTo(this, key, (_.isFunction(val)) ? val : this[val]);
            }, this);

            _.each(this.methodMap, function(val, key) {
                this.on(key + ':success', function(model, resp, options) {
                    var vpr = options.vpr || model.vpr;
                    if (vpr) {
                        Messaging.getChannel(vpr).trigger(key + ':success', model, resp, options);
                    }
                });
                this.on(key + ':error', function(model, resp, options) {
                    var vpr = options.vpr || model.vpr;
                    if (vpr) {
                        Messaging.getChannel(vpr).trigger(key + ':error', model, resp, options);
                    }
                });
            }, this);
        },
        setDefaultParameters: function(url, options) {
            var opts = options || {};
            var pid = this.patient.get(opts.patientIdentifierType) || this.patient.get('pid');
            return url.replace(/:pid/g, pid);
        },
        enteredInError: function(options) { //mimics destroy but calls it's own custom method
            options = options ? _.clone(options) : {};
            var model = this;
            var success = options.success;
            var wait = options.wait || true;
            var destroy = function() {
                model.trigger('destroy', model, model.collection, options);
                model.stopListening();
            };

            options.success = function(resp) {
                if (wait) destroy();
                if (success) success.call(options.context, model, resp, options);
                if (!model.isNew()) model.trigger('sync', model, resp, options);
            };

            var xhr = false;
            if (this.isNew()) {
                _.defer(options.success);
            } else {
                wrapError(this, options);
                xhr = this.sync('eie', this, options); //the only functional change
            }
            if (!wait) destroy();
            return xhr;
        },
    });

    var WritebackModel = AbstractModel,
        Modified = WritebackModel.extend({
            constructor: function() {
                var init = this.initialize;

                this.initialize = function() {
                    WritebackModel.prototype.initialize.apply(this, arguments);
                    if (WritebackModel.prototype.initialize === init) return;
                    init.apply(this, arguments);
                };

                WritebackModel.prototype.constructor.apply(this, arguments);
            }
        });

    return Modified;
});