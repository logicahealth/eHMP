module.exports = {
    rules: [{
        'name': 'systemUserPolicy',
        'on': true,
        'condition': function(R) {
            R.when(this.consumerType === 'system');
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }, {
        'name': 'accessOwnRecordPolicy',
        'on': true,
        'condition': function(R) {
            R.when(!this.dgRecordAccess && this.requestingOwnRecord);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Deny'
            };
            R.stop();
        }
    }, {
        'name': 'writebackNonLocalPatientPolicy',
        'on': true,
        'condition': function(R) {
            R.when((this.isPatientCentric && this.resourceConfigItemRel !== 'vha.read') && (this.patientPid.split(';')[0] !== this.site));
        },
        'consequence': function(R) {
            this.result = {
                code: 'Deny',
                text: 'Unable to save. The current patient does not have a record at the facility you have accessed. Please log into a facility where the patient is local to complete your transaction.'
            }; //TODO: implement this message once error view is centralized for all writebacks in ehmp-ui and can use this property for its ADK Alert message body text
            R.stop();
        }
    }, {
        'name': 'undefinedOrNoSSNPolicy',
        'on': true,
        'condition': function(R) {
            R.when(!this.hasSSN && !this.breakglass);
        },
        'consequence': function(R) {
            this.result = {
                code: 'BreakGlass',
                text: '\r\n***RESTRICTED RECORD***\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * \r\n* This record is protected by the Privacy Act of 1974 and the Health    *\r\n* Insurance Portability and Accountability Act of 1996. If you elect    *\r\n* to proceed, you will be required to prove you have a need to know.    *\r\n* Accessing this patient is tracked, and your station Security Officer  *\r\n* will contact you for your justification.                              *\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *',
                reason: 'PatientHasUndefinedSSN'
            };
            R.stop();
        }
    }, {
        'name': 'sensitivePolicyBreakglass',
        'on': true,
        'condition': function(R) {
            R.when(this.sensitive && !this.dgSensitiveAccess && !this.breakglass);
        },
        'consequence': function(R) {
            this.result = {
                code: 'BreakGlass',
                text: '\r\n***RESTRICTED RECORD***\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * \r\n* This record is protected by the Privacy Act of 1974 and the Health    *\r\n* Insurance Portability and Accountability Act of 1996. If you elect    *\r\n* to proceed, you will be required to prove you have a need to know.    *\r\n* Accessing this patient is tracked, and your station Security Officer  *\r\n* will contact you for your justification.                              *\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *',
                reason: 'SensitiveAccessRequired'
            };
            R.stop();
        }
    }, {
        'name': 'sensitivePolicyPermit',
        'on': true,
        'condition': function(R) {
            R.when(this.sensitive && !this.dgSensitiveAccess && this.breakglass);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }, {
        'name': 'default',
        'on': true,
        'condition': function(R) {
            R.when(true);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }]
};