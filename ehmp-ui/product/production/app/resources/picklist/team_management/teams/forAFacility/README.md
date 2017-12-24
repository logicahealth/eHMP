<!-- { "label": "For A Facility", "path": "Picklist.Team_Management.Teams.ForAFacility", "tags": ["teams", "facility"] } -->

::: page-description
# Teams For A Facility #
Team Management Teams For A Facility picklist resource collection.
:::

## Collection ##
Picklist collection used to fetch the list of eHMP teams for a specified facility. **Teams** extends the `ADK.Resources.Picklist.Collection` abstraction with the following options:

```JavaScript
var Teams = ADK.Resources.Picklist.Collection.extend({
    resource: 'write-pick-list-teams-for-facility',
    model: TeamsGroup,
    params: function(method, options) {
        return {
            facilityID: options.facilityID || '',
            site: options.site || ''
        };
    },
    parse: function(resp, options) {
        return [{
            groupName: 'All Teams',
            teams: _.get(resp, 'data', [])
        }];
    }
});
```


## Model ##
The **Teams** picklist collection specifies **TeamsGroup** as its `model`. **TeamsGroup** extends `ADK.Resources.Picklist.Group` and specifies the options below. Note that this also further defines the [**Team** model](./#/ui/resources/picklist/team_management/teams/#Team-Model) as the `model` to use in each group's sub-collection (which also extends `ADK.Resources.Picklist.Collection`).

```JavaScript
var TeamsGroup = ADK.Resources.Picklist.Group.extend({
    idAttribute: 'groupName',
    groupLabel: 'groupName',
    picklist: 'teams',
    Collection: ADK.Resources.Picklist.Collection.extend({
        model: Team,
        comparator: 'teamName'
    }),
    defaults: {
        groupName: '',
        teams: [] //this will be parsed into a Collection
    }
});
```

## Usage ##
### Definition ###
After resource load, the Teams For A Facility picklist is available at: `ADK.UIResources.Picklist.Team_Management.Teams.ForAFacility`
### Instantiation ###
```JavaScript
var teams = new ADK.UIResources.Picklist.Team_Management.Teams.ForAFacility();
```

### Fetch ###
#### Options ####
The `facilityID` (string) and `site` (string) properties are required when fetching the "Teams For A Facility" picklist.
```JavaScript
teams.fetch({
    facilityID: STATION_NUMBER_OF_FACILITY_TO_FIND_TEAMS_FOR,
    site: SITE_CODE // example 'SITE'
});
```
