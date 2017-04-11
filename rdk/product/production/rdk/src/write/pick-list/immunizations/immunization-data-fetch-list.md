# Group Pick List

## Immunization data [/immunization-data{?site}{&brief}{&activeOnly}{&selectableForHistoric}]

Return an array of the entries from the IMMUNIZATION file (9999999.14)

### Notes

PXVIMM IMMDATA

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + brief (boolean, optional) - A value of true indicates that the returned array is to contain just the first 10 fields list listed in the RETURNED VALUE description from the IMMUNIZATION file.

    + activeOnly (boolean, optional) - A value of true indicates that only active immunizations should be returned.

    + selectableForHistoric (boolean, optional) - A value of true indicates that records marked as SELECTABLE FOR HISTORIC `8803` should also be returned along with the active immunizations. This only has meaning if the activeOnly parameter is also set to true. Otherwise all records will be returned whether or not the SELECTABLE FOR HISTORIC flag is true.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


