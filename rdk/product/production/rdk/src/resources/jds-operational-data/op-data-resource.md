# Group Operational data

## Operational data type [{{{path}}}]

### Operational data type {type} [GET {{{path}}}/{type}{?limit}{&fields}]

Get a list of valid names by type

#### Notes

Returns a list of valid names of requested type

+ Parameters

    + type (enum[string], required) - Select name of list to be fetched

        + Members
            + `vital`
            + `laboratory`
            + `medication`


    :[limit]({{{common}}}/parameters/limit.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

+ Response 500 (application/json)

    + Body

            {
                "message": "Invalid type. Please use vital, laboratory, or medication.",
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

