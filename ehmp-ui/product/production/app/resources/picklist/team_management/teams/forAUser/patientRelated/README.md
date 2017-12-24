<!-- { "label": "Patient Related For A User", "path": "Picklist.Team_Management.Teams.PatientRelatedForAUser", "tags": ["teams", "user", "patient"] } -->

::: page-description
# Teams Patient Related For A User #
Team Management Teams Patient Related For A User picklist resource collection.
:::

## Collection ##
Picklist collection used to fetch the list of eHMP teams for a specified user and patient. **Teams** extends the `ADK.Resources.Picklist.Collection` abstraction with the following options:

```JavaScript
var Teams = ADK.Resources.Picklist.Collection.extend({
    resource: 'write-pick-list-teams-for-user-patient-related',
    model: TeamsGroup,
    params: function(method, options) {
        return {
            staffIEN: options.staffIEN || '',
            pid: options.patientID || ''
        };
    },
    parse: function(resp, options) {
        return [{
            groupName: 'My Teams Associated with Patient',
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
After resource load, the Teams Patient Related For A User picklist is available at: `ADK.UIResources.Picklist.Team_Management.Teams.PatientRelatedForAUser`
### Instantiation ###
```JavaScript
var teams = new ADK.UIResources.Picklist.Team_Management.Teams.PatientRelatedForAUser();
```

### Fetch ###
#### Options ####
The `staffIEN` (string) and `patientID` (string) properties are required when fetching the "Teams Patient Related For A User" picklist.
```JavaScript
teams.fetch({
    staffIEN: USER_IEN,
    patientID: PATIENT_PID_OR_ICN // sent in request as 'pid' property
});
```
