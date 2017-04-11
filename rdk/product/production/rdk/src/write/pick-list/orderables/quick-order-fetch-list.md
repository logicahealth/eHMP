# Group Pick List

## Quick Orders [/quick-orders{?site}{&searchString}{&userId}]

Searches for quick orders -- note that this involves a call to pjds instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, optional) - Text to filter the orders by.

    + userId (string, optional) - Find orders just for this user.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


