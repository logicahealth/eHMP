# Group Shortcuts

## Shortcuts [{{{path}}}]

### Get [GET {{{path}}}]

Get a list of objects correlating link titles and shortcut URLs

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "title": "my health vet",
                            "label": "My HealthVet",
                            "url": "#"
                        }, {
                            "title": "hospital link",
                            "label": "Hospital Link",
                            "url": "#"
                        }, {
                            "title": "scheduling",
                            "label": "Scheduling",
                            "url": "#"
                        }, {
                            "title": "team link",
                            "label": "Team Link",
                            "url": "#"
                        }, {
                            "title": "direct link",
                            "label": "Direct Link",
                            "url": "#"
                        }
                    ]
                }
            }

    + Schema

            :[Schema]({{{common}}}/schemas/shortcuts_list-GET-200.jsonschema)


