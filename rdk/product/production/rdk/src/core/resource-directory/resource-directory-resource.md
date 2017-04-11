# Group Resource Directory

## Resource Directory [{{{path}}}]

List the resources that the RDK exposes. Clients should generally refer to resources by their title and use this resource directory to look up the corresponding href.

### List [GET]

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "link": [{
                        "title": "resource-directory",
                        "href": "/resource/resourcedirectory",
                        "rel": "vha.read"
                    }, {
                        "title": "resource-directory-html",
                        "href": "/resource/resourcedirectory/html"
                    }, {
                        "title": "resource-directory-cors",
                        "href": "/resource/resourcedirectory/cors",
                        "rel": "vha.read"
                    }, {
                        "title": "resource-directory-cors-html",
                        "href": "/resource/resourcedirectory/cors/html"
                    }, {
                        "title": "healthcheck-healthy",
                        "href": "/resource/healthcheck/healthy",
                        "rel": "vha.read"
                    }, {
                        "title": "healthcheck-detail-html",
                        "href": "/resource/healthcheck/detail/html",
                        "rel": "vha.read"
                    }, {
                        "title": "healthcheck-checks",
                        "href": "/resource/healthcheck/checks",
                        "rel": "vha.read"
                    }, {
                        "title": "healthcheck-detail",
                        "href": "/resource/healthcheck/detail",
                        "rel": "vha.read"
                    }, {
                        "title": "healthcheck-noupdate",
                        "href": "/resource/healthcheck/noupdate",
                        "rel": "vha.read"
                    }]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/resourcedirectory-GET-200.jsonschema)

+ Response 200 (text/html)

