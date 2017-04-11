# Group Pick List

## Favorite Orderables [/favorite-orderables{?site}{&userId}]

Searches for favorite orderables -- note that this involves a call to pjds instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + userId (string, optional) - Find orderables just for this user.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)
