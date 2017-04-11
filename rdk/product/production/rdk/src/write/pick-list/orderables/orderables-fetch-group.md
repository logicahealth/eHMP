# Group Pick List

## Orderables [/orderables{?site}{&searchString}{&subtype}]

Return orderables from multiple sources.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, optional) - Text to filter the order sets by.

    + subtype (string, optional) - Find order sets just for this user, defaults to `all`.

        Options include `lab` (lab orderables), `quick` (quick orders), `fav` (favorites), `set` (order sets), and `entr` (enterprise orderables). Multiple options can be provided, separated by a colon `:`.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)
