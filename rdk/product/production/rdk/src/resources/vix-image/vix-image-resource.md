# VIX Image

## VIX Image [{{{path}}}]

### Single Image Meta [GET {{{path}}}/single{?pid}{&siteNumber}{&contextId}]

Get a single image meta data from the VIX server

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md required:"required")

    + siteNumber (string, required) - Site Number for where the image is located

    + contextId (string, required) - Context ID of the image you want to get the meta data for

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "patientICN": "10108V420871",
                    "siteNumber": "500",
                    "authSiteNumber": "500",
                    "items": [{
                        "contextId": "12349",
                        "patientICN": "10108V420871",
                        "siteNumber": "500",
                        "detailsUrl": "http://54.235.252.102:9911/vix/viewer/studydetails?ContextId=12349&SiteNumber=500&PatientICN=10108V420871&SecurityToken=MjAxNy0wMi0xMlQwNTowMDowMC4wMDAwMDAwWnxjVW0yYlVaMkxHMnNNMG1NR2RWZDFqN084TUg3MmVfME54SEp2ZXZRdWQ4dEJCdXZkWU9ZX25QZTA0MFNOZEMza2VPODhqT2cyRnZYR0pKRUZ1YVRRQT09fGEyYTY0MjFkLTU0NjktNGEyOS04ZDNmLTE5YWY3MzE5M2FkNXxBN09FU0RLSTFvSW52UlMyUklRaU5yM2dic050Q20rY1lIWFVMYk8vazhEV0tjZm5IQW8xMVdneG42M3c4U29pekpzZkVPZlV2TXRmYW16WGlkOWErZ3NhZzdHbExrV0hha29Ic0hGWFVDMD0%3d&AuthSiteNumber=500",
                        "viewerUrl": "http://54.235.66.32:9911/vix/viewer/loader?ContextId=12349&SiteNumber=500&PatientICN=10108V420871&SecurityToken=MjAxNy0wMi0xMlQwNTowMDowMC4wMDAwMDAwWnxjVW0yYlVaMkxHMnNNMG1NR2RWZDFqN084TUg3MmVfME54SEp2ZXZRdWQ4dEJCdXZkWU9ZX25QZTA0MFNOZEMza2VPODhqT2cyRnZYR0pKRUZ1YVRRQT09fGEyYTY0MjFkLTU0NjktNGEyOS04ZDNmLTE5YWY3MzE5M2FkNXxBN09FU0RLSTFvSW52UlMyUklRaU5yM2dic050Q20rY1lIWFVMYk8vazhEV0tjZm5IQW8xMVdneG42M3c4U29pekpzZkVPZlV2TXRmYW16WGlkOWErZ3NhZzdHbExrV0hha29Ic0hGWFVDMD0%3d&AuthSiteNumber=500",
                        "imageCount": 0,
                        "isSensitive": false
                    }]
                },
                "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)
