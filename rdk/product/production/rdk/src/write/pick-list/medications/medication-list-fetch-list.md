# Group Pick List

## Medication list [/medication-list{?site}{&searchString}{&fields}]

DIRECT RPC CALL - Retrieves Outpatient Medication ORDER QUICK VIEW file #101.44 subset of orderable items or quick orders in alphabetical order to specific sequence numbers

### Notes

ORWUL FV4DG

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - Examples: `NV RX` or `O RX`; those are the only ones we've seen used so far

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

			{
			  "data": [
			    {
			      "ien": "92",
			      "totalCountOfItems": "2859"
			    }
			  ],
			  "status": 200
			}

    + Schema

            :[schema]({{{common}}}/schemas/medication-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


