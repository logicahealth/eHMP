# Group Order

## Order detail [{{{path}}}]

### Get [GET {{{path}}}/detail/{uid}{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + uid (string, required) - The UID of the order to retrieve details for. If the site of the UID is a connected site, then a direct RPC is used to fetch the details.


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

