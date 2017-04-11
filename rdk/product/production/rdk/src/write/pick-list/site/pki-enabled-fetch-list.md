# Group Pick List

## Pki enabled [/pki-enabled{?site}]

Determines if the PKI Digital Signature is enabled on the site

### Notes

ORWOR PKISITE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "enabled": true
                },
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/pki-enabled-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


