define([], function() {
    "use strict";

    var signalNames = {
        CONSULT: {
            END: 'END',
            EDIT: 'EDIT',
            APPT: {
                CANCELED: 'APPT.CANCELED',
                KEPT: 'APPT.KEPT'
            },
            CLAIM: 'CLAIM',
            COMPLETE: 'COMPLETE',
            COMMUNITY: {
                UPDATE: {
                    PENDING: 'COMMUNITY.UPDATE.PENDING',
                    SCHEDULED: 'COMMUNITY.UPDATE.SCHEDULED',
                }
            },
            RESCHEDULE: 'RESCHEDULE',
            RELEASE: {
                CONSULT: 'RELEASE.CONSULT',
                EWL: 'RELEASE.EWL',
                COMMUNITY: 'RELEASE.COMMUNITY'
            }
        }
    };

    return signalNames;
});