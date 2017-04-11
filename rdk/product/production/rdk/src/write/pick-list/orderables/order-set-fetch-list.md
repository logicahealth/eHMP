# Group Pick List

## Order Sets [/order-sets{?site}{&searchString}{&userId}]

Searches for order sets -- note that this involves a call to pjds instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, optional) - Text to filter the order sets by.

    + userId (string, optional) - Find order sets just for this user.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)
