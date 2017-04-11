# Group Cds

## Cds execute cds execute [{{{path}}}]

### Get [GET {{{path}}}/request{?name}{&id}]

Execution Request resource

#### Notes

Get execution request(s)

+ Parameters

    + name (string, optional) - name of execution request

    + id (string, optional) - id of execution request

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST {{{path}}}/request]

Execution Request resource

#### Notes

Create an execution request

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put [PUT {{{path}}}/request]

Execution Request resource

#### Notes

Update an execution request

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/request{?id}{&name}]

Execution Request resource

#### Notes

Delete an excution request

+ Parameters

    + id (string, optional) - id of execution request

    + name (string, optional) - name of execution request


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

