# Group Pick List

## Lab order orderable items [/lab-order-orderable-items{?site}{&labType}{&searchString}]

Large Pick List - Get list of orderable Lab Orders

### Notes

ORWDX ORDITM

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + labType: `S.LAB` (string, required) - The type of lab order for which to get a list of orderable items

    + searchString (string, optional)

        The location to start returning data from - call with an empty String to retrieve the start of the data.
        To retrieve the next set of 44 records, call this with the value contained in the 44th record's "synonym" field.
        Used when an RPC call requires a minimum of 3 characters in order to return data.
        This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;
        however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the
        first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "ien": "515",
                        "synonym": "1,25-DIHYDROXYVIT D",
                        "name": "1,25-DIHYDROXYVIT D"
                    },
                    {
                        "ien": "350",
                        "synonym": "11-DEOXYCORTISOL",
                        "name": "11-DEOXYCORTISOL"
                    },
                    {
                        "ien": "683",
                        "synonym": "17-HYDROXYCORTICOSTEROIDS",
                        "name": "17-HYDROXYCORTICOSTEROIDS"
                    }
                ],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/lab-order-orderable-items-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"lab-order-orderable-items")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


