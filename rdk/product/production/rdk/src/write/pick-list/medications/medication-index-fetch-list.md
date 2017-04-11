# Group Pick List

## Medication index [/medication-index{?site}{&searchString}{&ien}]

Get the index of a medication that meets a search term

### Notes

ORWUL FVIDX

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString: `ACD` (string, required) - A string that is the closest match to the index you want to start returning data from

    + ien: `31` (number, required) - There is differing opinions on where this IEN comes from. One source says it comes from rpc 'ORWUL FV4DG' Another source says the following: Examples:  31 = O RX, for Outpatient Meds, 32 = UD RX, for Unit Dose – Inpatient Meds. There is no RPC that retrieves this IEN.  It is hardcoded in CPRS GUI code and passed as a literal string input. Use the quickViewIen 31 for Outpatient Medications.

### GET

+ Response 200 (application/json)

    + Body

			{
			  "data": [
			    {
			      "ien": "219",
			      "name": "ASPIRIN BUFFERED TAB "
			    }
			  ],
			  "status": 200
			}

    + Schema

            :[schema]({{{common}}}/schemas/medication-index-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


