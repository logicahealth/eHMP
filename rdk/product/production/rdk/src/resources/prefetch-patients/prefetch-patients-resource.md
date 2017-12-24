# Group Prefetch Patients

## Prefetch Patients [{{{path}}}]

### Prefetch Patients [GET {{{path}}}{?strategy}{&timeframeStart}{&timeframeEnd}{&facility}{&clinic}]

Retrieve patients that will likely be used by eHMP or other systems in the near future.

+ Parameters

    + strategy: `appointment` (string, required) - Query strategy.  Currently supports all, eHMP and appointment.

    + facility: `501` (string, optional) - Station number.

    + clinic: `AUDIOLOGY` (string, optional) - Clinic name.

    + timeframeStart: `2017-03-10` (string, optional) - Start date for range query in YYYY-MM-DD format.  Default is today.

    + timeframeEnd: `2017-03-11` (string, optional) - End date for range query in YYYY-MM-DD format.  Default is one day in the future.

+ Response 200 (application/json)

	+ Body

		    {
              "patient": [          
                  {
                    "patientIdentifier": "78956789^PI^516^USVHA^P",
                    "isEhmpPatient": true
                  },
                  {
                    "patientIdentifier": "89567891^PI^516^USVHA^P",
                    "isEhmpPatient": true
                  },
                  {
                    "patientIdentifier": "95678911^PI^516^USVHA^P",
                    "isEhmpPatient": false
                  }
              ],
              "outboundQueryCriteria": {
                  "eHX": {
                      "classCode": "('34133-9^^2.16.840.1.113883.6.1')",
                      "status": "('urn:ihe:iti:2010:StatusType:DeferredCreation','urn:oasis:names:tc:ebxml-regrep:StatusType:Approved')"
                  }
              }
			}

    + Schema

    		:[Schema]({{{common}}}/schemas/prefetch-patients.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)
