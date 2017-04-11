# Group Cds

## Cds work product [{{{path}}}]

### Cds work product create [POST {{{path}}}/product]

Work Product resource

#### Notes

Create work product

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Cds work product retrieve [GET {{{path}}}/product{?id}]

Work Product resource

#### Notes

Get work product

+ Parameters

    + id (string, optional) - work product id; `*` means it returns the first 500 work products

        + Default: `*`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Cds work product update [PUT {{{path}}}/product{?id}]

Work Product resource

#### Notes

Update work product

+ Parameters

    + id (string, required) - work product id

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Cds work product delete [DELETE {{{path}}}/product{?id}]

Work Product resource

#### Notes

Delete work product

+ Parameters

    + id (string, required) - work product id


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Cds work product subscription retrieve [GET {{{path}}}/subscriptions]

Work Product resource

#### Notes

Retrieve subscription for user

+ Response 200 (application/json)


### Cds work product subscription update [PUT {{{path}}}/subscriptions]

Work Product resource

#### Notes

Insert/Update subscription for user

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Cds work product subscription delete [DELETE {{{path}}}/subscriptions]

Work Product resource

#### Notes

Delete subscription for user

+ Response 200 (application/json)


### Inbox [GET {{{path}}}/inbox]

Work Product resource

#### Notes

Get inbox for user

+ Response 200 (application/json)

