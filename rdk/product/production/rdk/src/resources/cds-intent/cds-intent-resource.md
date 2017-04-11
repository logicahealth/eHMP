# Group Cds

## Cds intent cds intent [{{{path}}}]

### Get [GET {{{path}}}/registry{?name}{&scope}{&scopeId}]

Intent resource

#### Notes

Get intents

+ Parameters

    + name (string, optional) - name of intent

    + scope (string, optional) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST {{{path}}}/registry]

Intent resource

#### Notes

Create an intent

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Put [PUT {{{path}}}/registry{?name}{&scope}{&scopeId}]

Intent resource

#### Notes

Update an intent

+ Parameters

    + name (string, required) - name of intent

    + scope (string, required) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/registry{?name}{&scope}{&scopeId}]

Intent resource

#### Notes

Delete an intent

+ Parameters

    + name (string, optional) - name of intent

    + scope (string, optional) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

