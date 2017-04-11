define([
    "jasminejquery",
    "app/applets/patient_sync_status/views/detailsModalView"
], function(jasmine, DetailsModalView) {
    'use strict';

    var syncMap = {
      "mySite": {
        "sites": []
      },
      "allVa": {
        "sites": [
          {
            "sourceName": "9E7A",
            "status": {
              "syncCompleted": true
            }
          }
        ]
      }
    };

    var jobStatuses = [
        {
            "site":"C877",
            "siteDisplayName":"KODAK",
            "status":"inProgress",
            "type":"jobStatus",
            "siteType":"primary"
        }
    ];

    //to see results in a tests console output try:
    //console.error(JSON.stringify(results));

    describe("makeMapReadyForUI", function() {
        it("handles open jobs for sites that are in not in siteMapping", function() {
            expect(DetailsModalView).toBeDefined();
            DetailsModalView.prototype.makeMapReadyForUI(syncMap, jobStatuses, {}, {});
            expect(syncMap.allVa.sites.length).toEqual(2);
            expect(syncMap.allVa.status).toEqual("inProgress");
            expect(syncMap.allVa.allDomains.length).toEqual(1);
            expect(syncMap.allVa.allDomains).toEqual(jobStatuses);
        });
    });
});
