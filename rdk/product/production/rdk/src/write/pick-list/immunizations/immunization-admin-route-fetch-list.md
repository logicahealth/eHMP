# Group Pick List

## Immunization admin route [/immunization-admin-route{?site}{&filter}{&date}]

Returns entries from the IMM ADMINISTRATION ROUTE file (920.2).

### Notes

PXVIMM ADMIN ROUTE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + filter: `S:B` (string, optional) - Can be `R:XXX`, `H:XXX`, `N:XXX`, `S:A`, `S:I`, or `S:B`.  Where R is for IEN's, H is for HL7 Code's, N is for the Name, and S is for the Status.  The `A`, `I`, and `B` in Status is for A=Active Entries, I=Inactive Entries, and B=Both Active and Inactive. The XXX for `R`, `H`, and `N` is a String matching the entry you want to filter.

    :[date]({{{common}}}/parameters/date.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "ien": "1",
                        "name": "INTRADERMAL",
                        "hl7Code": "ID",
                        "status": "1"
                    },
                    {
                        "ien": "2",
                        "name": "INTRAMUSCULAR",
                        "hl7Code": "IM",
                        "status": "1"
                    },
                    {
                        "ien": "3",
                        "name": "INTRAVENOUS",
                        "hl7Code": "IV",
                        "status": "1"
                    },
                    {
                        "ien": "7",
                        "name": "TRANSDERMAL",
                        "hl7Code": "TD",
                        "status": "1"
                    }
                ],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-admin-route-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


