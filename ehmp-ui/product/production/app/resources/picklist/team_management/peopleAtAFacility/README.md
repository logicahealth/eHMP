<!-- { "label": "At A Facility", "path": "Picklist.Team_Management.People.AtAFacility", "tags": ["person", "people", "users"] } -->

::: page-description
# People At A Facility #
Team Management People At A Facility picklist resource collection.
:::

## Collection ##
Picklist collection used to fetch the list of eHMP users for a specified facility. **People** extends the `ADK.Resources.Picklist.Collection` abstraction with the following options:

```JavaScript
var People = ADK.Resources.Picklist.Collection.extend({
    resource: 'write-pick-list-people-for-facility',
    model: Person,
    params: function(method, options) {
        return {
            facilityID: options.facilityID || ''
        };
    }
});
```

## Model ##
Uses **Person** as the collection's `model` attribute. **Person** extends the `ADK.Resources.Picklist.Model` abstraction and specifies the following options:

```JavaScript
var Person = ADK.Resources.Picklist.Model.extend({
    idAttribute: 'personID',
    label: 'name',
    value: 'personID',
    childParse: 'false',
    defaults: {
        name: '',
        personID: ''
    }
});
```

## Usage ##
### Definition ###
After resource load, the People At A Facility picklist is available at: `ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility`
### Instantiation ###
```JavaScript
var people = new ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility();
```

### Fetch ###
#### Options ####
The `facilityID` (string) property is required when fetching the "People At A Facility" picklist.
```JavaScript
people.fetch({
	facilityID: this.model.get('facility')
});
```
