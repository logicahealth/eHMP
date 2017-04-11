# Group Pick List

## Enterprise Orderables [/enterprise-orderables{?site}{&searchString}]

Searches for enterprise orderables -- note that this involves a call to pjds instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, optional) - Text to filter the orderables by.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)
