# Group Pick List

## Lab order specimens [/lab-order-specimens{?site}]

Returns a list of specimens from the TOPOGRAPHY FIELD file (#61).

### Notes

ORWDLR32 ALLSPEC

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "ien": "8755",
                    "name": "24 HR URINE    (URINE)"
                }, {
                    "ien": "114",
                    "name": "ABDOMEN    (Y4100)"
                }, {
                    "ien": "8394",
                    "name": "ABDOMEN, PERITONEUM AND RETROPERITONEUM    (Y4000)"
                }, {
                    "ien": "1001",
                    "name": "ABDOMINAL AORTA    (42500)"
                }, {
                    "ien": "7658",
                    "name": "ABDOMINAL AORTIC PLEXUS    (X9805)"
                }],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/lab-order-specimens-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"lab-order-specimens")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


