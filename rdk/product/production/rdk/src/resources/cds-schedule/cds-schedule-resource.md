# Group Cds

## Cds schedule cds schedule [{{{path}}}]

### Get [GET {{{path}}}/job{?id}{&jobname}{&fields}]

Schedule resource

#### Notes

Get scheduled job(s)

+ Parameters

    + id (string, optional) - id of schedule job

    + jobname (string, optional) - name of schedule job

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST {{{path}}}/job{?jobname}{&cdsname}{&when}{&interval}]

Schedule resource

#### Notes

Create a job schedule

+ Parameters

    + jobname (string, required) - name of schedule job

    + cdsname (string, required) - name of CDS Request

    + when (string, optional) - when to schedule the job to run

    + interval (string, optional) - how often to run the job


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put [PUT {{{path}}}/job{?jobname}{&when}{&interval}{&enable}{&disable}]

Schedule resource

#### Notes

Update a scheduled job

+ Parameters

    + jobname (string, required) - name of schedule job

    + when (string, optional) - when to schedule the job to run

    + interval (string, optional) - how often to run the job

    + enable (string, optional) - enable job

    + disable (string, optional) - disable job


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/job{?id}{&jobname}]

Schedule resource

#### Notes

Delete a sceduled job

+ Parameters

    + id (string, optional) - id of schedule job

    + jobname (string, optional) - name of schedule job


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

