define([
    "backbone",
    "marionette",
    "underscore"
], function(Backbone, Marionette, _) {
    'use strict';

    var Helper = (function() {

        var newUnsignedOrderDetail = '25 OH VITAMIN D BLOOD SERUM SP *UNSIGNED*\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '01/04/2016 20:06 New Order entered by XIU,MARGARET\r\n' +
            'Order Text: 25 OH VITAMIN D BLOOD SERUM SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Ordered by: XIU,MARGARET\r\n' +
            'Signature: NOT SIGNED\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: \r\n' +
            'Ordering Location: DRUGSTER\r\n' +
            'Start Date/Time: \r\n' +
            'Stop Date/Time: \r\n' +
            'Current Status: UNRELEASED\r\n' +
            'Orders that have not been released to the service for action.\r\n' +
            'Order #39103\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: 25 OH VITAMIN D \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: SERUM \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'Comments: \r\n' +
            'How often: ONE TIME';

        var signedOrderDetail = '25 OH VITAMIN D BLOOD SERUM SP LB #18443\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '01/04/2016 20:06 New Order entered by XIU,MARGARET\r\n' +
            'Order Text: 25 OH VITAMIN D BLOOD SERUM SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Elec Signature: XIU,MARGARET on 01/05/2016 21:46\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: \r\n' +
            'Ordering Location: DRUGSTER\r\n' +
            'Start Date/Time: 01/05/2016\r\n' +
            'Stop Date/Time: \r\n' +
            'Current Status: PENDING\r\n' +
            'Orders that have been placed but not yet accepted by the service \r\n' +
            'filling the order. e.g., Pharmacy orders awaiting verification, \r\n' +
            'Lab orders awaiting collection.\r\n' +
            'Order #39103\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: 25 OH VITAMIN D \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: SERUM \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'Comments: \r\n' +
            'How often: ONE TIME';

        var discontinuedUnsignedOrderDetail = 'CBC + DIFF (AUTO) BLOOD SP LB #18556\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '12/30/2015 20:11 New Order entered by XIU,MARGARET\r\n' +
            'Order Text: CBC + DIFF (AUTO) BLOOD SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Elec Signature: XIU,MARGARET on 12/30/2015 20:17\r\n' +
            '12/30/2015 20:18 Discontinue entered by XIU,MARGARET\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Ordered by: XIU,MARGARET\r\n' +
            'Signature: NOT SIGNED\r\n' +
            'Reason for DC: Per Policy\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: \r\n' +
            'Ordering Location: DRUGSTER\r\n' +
            'Start Date/Time: 12/30/2015\r\n' +
            'Stop Date/Time: \r\n' +
            'Current Status: PENDING\r\n' +
            'Orders that have been placed but not yet accepted by the service \r\n' +
            'filling the order. e.g., Pharmacy orders awaiting verification, \r\n' +
            'Lab orders awaiting collection.\r\n' +
            'Order #39100\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: CBC + DIFF (AUTO) \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: BLOOD \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'Comments: \r\n' +
            'How often: ONE TIME';

        var discontinuedOrderDetail = 'Discontinue PROTIME BLOOD PLASMA SP LB #18555\r\n' +
            '<Requesting Physician Cancelled>\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '12/30/2015 20:11 New Order entered by XIU,MARGARET\r\n' +
            'Order Text: PROTIME BLOOD PLASMA SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Elec Signature: XIU,MARGARET on 12/30/2015 20:13\r\n' +
            '12/30/2015 20:14 Discontinue entered by XIU,MARGARET\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Elec Signature: XIU,MARGARET on 12/30/2015 20:16\r\n' +
            'Reason for DC: Requesting Physician Cancelled\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: \r\n' +
            'Ordering Location: DRUGSTER\r\n' +
            'Start Date/Time: 12/30/2015\r\n' +
            'Stop Date/Time: 12/30/2015 20:16\r\n' +
            'Current Status: DISCONTINUED\r\n' +
            'Orders that have been explicitly stopped.\r\n' +
            'Order #39101\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: PROTIME \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: PLASMA \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'Comments: \r\n' +
            'How often: ONE TIME';

        var canceledOrderDetail = '25 OH VITAMIN D BLOOD SERUM SP\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '12/30/2015 20:10 New Order entered by XIU,MARGARET\r\n' +
            'Order Text: 25 OH VITAMIN D BLOOD SERUM SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Ordered by: XIU,MARGARET\r\n' +
            'Signature: NOT REQUIRED DUE TO SERVICE CANCEL/LAPSE\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: \r\n' +
            'Ordering Location: DRUGSTER\r\n' +
            'Start Date/Time: \r\n' +
            'Stop Date/Time: \r\n' +
            'Current Status: CANCELLED\r\n' +
            'Orders that have been rejected by the ancillary service without \r\n' +
            'being acted on, or terminated while still delayed.\r\n' +
            'Order #39098\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: 25 OH VITAMIN D \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: SERUM \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'Comments: \r\n' +
            'How often: ONE TIME';

        var completedOrderDetail = 'CHEM 7 BLOOD SERUM SP LB #18415\r\n' +
            '\r\n' +
            'Activity:\r\n' +
            '01/29/2015 15:15 New Order entered by VEHU,TEN (Physician)\r\n' +
            'Order Text: CHEM 7 BLOOD SERUM SP\r\n' +
            'Nature of Order: ELECTRONICALLY ENTERED\r\n' +
            'Elec Signature: VEHU,TEN (Physician) on 01/29/2015 15:16\r\n' +
            '\r\n' +
            'Current Data:\r\n' +
            'Current Primary Provider: PROVIDER,TWENTY\r\n' +
            'Current Attending Physician: PROVIDER,THIRTY\r\n' +
            'Treating Specialty: GENERAL MEDICINE\r\n' +
            'Ordering Location: 7A GEN MED\r\n' +
            'Start Date/Time: 01/29/2015 15:17\r\n' +
            'Stop Date/Time: 01/29/2015 15:30\r\n' +
            'Current Status: COMPLETE\r\n' +
            'Orders that require no further action by the ancillary service. \r\n' +
            'e.g., Lab orders are completed when results are available, \r\n' +
            'Radiology orders are complete when results are available.\r\n' +
            'Order #38284\r\n' +
            '\r\n' +
            'Order:\r\n' +
            'Lab Test: CHEM 7 \r\n' +
            'Collected By: Send patient to lab \r\n' +
            'Collection Sample: BLOOD \r\n' +
            'Specimen: SERUM \r\n' +
            'Collection Date/Time: TODAY \r\n' +
            'Urgency: ROUTINE \r\n' +
            'How often: ONE TIME';

        var getNewOrder = function() {
            return new Backbone.Model({
                statusName: "UNRELEASED",
                detailSummary: newUnsignedOrderDetail,
                clinicians: [],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var getSignedOrder = function() {
            return new Backbone.Model({
                statusName: "PENDING",
                detailSummary: signedOrderDetail,
                clinicians: ["Doctor Foo"],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var getDiscontinuedUnsignedOrder = function() {
            return new Backbone.Model({
                statusName: "DISCONTINUED",
                detailSummary: discontinuedUnsignedOrderDetail,
                clinicians: ["Doctor Foo"],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var getDiscontinuedOrder = function() {
            return new Backbone.Model({
                statusName: "DISCONTINUED",
                detailSummary: discontinuedOrderDetail,
                clinicians: ["Doctor Foo"],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var getCanceledOrder = function() {
            return new Backbone.Model({
                statusName: "CANCELLED",
                detailSummary: canceledOrderDetail,
                clinicians: ["Doctor Foo"],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var getCompletedOrder = function() {
            return new Backbone.Model({
                statusName: "COMPLETE",
                detailSummary: completedOrderDetail,
                clinicians: ["Doctor Foo"],
                uid: 'urn:va:order:SITE:3:44259'
            });
        };

        var describe = function(stubText, stubFunction) {
            //Nothing
        };

        return {
            Mocks: {
                getNewOrder: getNewOrder,
                getSignedOrder: getSignedOrder,
                getDiscontinuedUnsignedOrder: getDiscontinuedUnsignedOrder,
                getDiscontinuedOrder: getDiscontinuedOrder,
                getCanceledOrder: getCanceledOrder,
                getCompletedOrder: getCompletedOrder
            },
            describe: describe
        };
    })();

    return Helper;
});