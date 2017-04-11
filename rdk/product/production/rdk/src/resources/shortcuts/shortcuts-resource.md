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
                            "title": "my health vet portal",
                            "label": "MyHealtheVet Portal",
                            "url": "https://myhealth.DNS   /mhv-portal-web/"
                        }, {
                            "title": "hospital link",
                            "label": "Hospital Link",
                            "url": "http://www.DNS   /directory/guide/division.asp?dnum=1"
                        }, {
                            "title": "team link",
                            "label": "Team Link",
                            "url": "https://vaww-pcmm.cc.med.DNS   /ciss/"
                        }, {
                            "title": "direct link",
                            "label": "Direct Link",
                            "url": "https://direct.DNS   /"
                        }
                    ]
                }
            }

    + Schema

            :[Schema]({{{common}}}/schemas/shortcuts_list-GET-200.jsonschema)


