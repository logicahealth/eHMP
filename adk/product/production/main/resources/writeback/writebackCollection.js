define([
    'main/resources/abstract',
    'api/Messaging',
    'api/PatientRecordService',
    'api/UserService'
], function(Abstract, Messaging, PatientRecordService, UserService) {
    "use strict";

    var AbstractCollection = Abstract.Collection.extend({
        url: undefined,
        create: function(model, options) {
            options = options ? _.clone(options) : {};
            if (!(model = this._prepareModel(model, options))) return false;
            var collection = this;
            //we don't want to do anything on success--the model will fire an event which will add it to the collection for us
            model.save(null, options);
            return model;
        },
        setDefaultParameters: function(url, options) {
            var opts = options || {};
            var pid = this.patient.get(opts.patientIdentifierType) || this.patient.get('pid');
            return url.replace(/:pid/g, pid);
        }
    });


    var WritebackCollection = AbstractCollection,
        Modified = WritebackCollection.extend({
            constructor: function() {
                //keep a pointer to the logged in user
                this.user = UserService.getUserSession();
                if (_.isUndefined(this.user.get('duz'))) {
                    throw new Error('No user has logged in.  Resource collection cannot be instanted without user data available.');
                }

                //keep a pointer to the logged in patient
                this.patient = PatientRecordService.getCurrentPatient();
                if (_.isUndefined(this.patient.get('pid'))) {
                    throw new Error('No patient has been selected.  Resource collection cannot be instanted without patient data available.');
                }

                _.each(this.resourceEvents, function(val, key) {
                    this.listenTo(this, key, (_.isFunction(val)) ? val : this[val]);
                }, this);

                WritebackCollection.prototype.constructor.apply(this, arguments);
            }
        });

    return Modified;
});