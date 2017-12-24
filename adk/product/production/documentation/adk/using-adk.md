::: page-description
# API, Utilities & Services #
List of all available API calls, utilities, and services that the ADK exposes
:::

## Collections ##

**`ADK.Collections`** are Backbone collection definitions with extended fetch mechanisms, as well as additional functionality depending on which collection is being used. **`ADK.Collections`** should be the mechanism used to fetch and maintain domain data from the resource server, instead of the now deprecated ADK.ResourceService and ADK.PatientRecordService.

**Note:** anything the BaseCollection supports, the other collections will also support as they extend the BaseCollection.

To see full options, see the sections below. An example usage (using BaseCollection):

```JavaScript
var fetchOptions = {
  resourceTitle: 'my-resource-title-from-directory'
};
var myColl = new ADK.Collections.BaseCollection();
myColl.fetch(fetchOptions);
```

### BaseCollection ###

The base collection definition that the other collections in **`ADK.Collections`** extend from. The fetch function has been extended to generate the url from the ResourceDirectory, as well as apply patient information relevant to the fetch url if `patientData: true`.

#### Fetching ####

After instantiation (`var myColl = new ADK.Collections.BaseCollection()`), you have two options to retrieve the data:

**GET** : simply call `myColl.fetch(fetchOptions)`

**POST** : simply call `myColl.post(fetchOptions)` (alternatively, set `type: 'POST'` with `.fetch`)

There is no difference on how the fetchOptions needs to be formatted between `.fetch` and `.post` -- the `BaseCollection` handles that for you.

##### FetchOptions #####

```JavaScript
// Available options, in addition to most xhr/Backbone.Model fetch options.
// Defaults shown where applicable.
var fetchOptions = {
  type: 'GET', // `type: 'POST'` is alternative to calling `myColl.post`
  cache: true, // whether the fetch url and response will be cached
  patientData: false, // sends pid of current patient
  resourceTitle: 'my-resource-title-from-directory', // maps to ResourceDirectory
  allowAbort: true, // if another fetch goes out, abort will be called
  criteria: { // send as part of the query string parameters
    template: 'notext' // an example, will be resource-specific
  } // this above would parse to '?template=notext' in the url
};
```

#### Use Case ####

This collection type should be used for simple data fetches in which server paging, sorting, and/or filtering is not required.

#### Parse Error Catching ####

Each parse call is wrapped in a try/catch and upon an uncaught error, the collection will throw an 'error' event, which can be treated the same as a fetch error.

### ServerCollection ###

Extends [BaseCollection](#Collections-BaseCollection), and adds server-side functionality, such as getting and managing pages of data, sorting while managing page state, and filtering appropriately. Supports [QueryBuilder](#Collections-QueryBuilder) on `this.Criteria`.

#### FetchOptions ####
```JavaScript
// in addition to the options supported in BaseCollection
var fetchOptions = {
  sortKey: "dateTime desc, referenceDateTime desc"
};
```

#### Functions ####
- **serverSort(sortKey, fetchOptions)**: sets new sort key then triggers fetch. Calls `reset` with state option set to 'sorting'
- **serverFilter(filterObject, fetchOptions)**: filterObject should have `values` and `fields`. Calls `reset` with state option set to 'filtering'
- **hasNextPage**: returns true if there are more total items than the current start index
- **getNextPage(fetchOptions)**: fetches next page if `hasNextPage` returns true

#### Use Case ####

This collection should be used when server-side paging, sorting, and filtering is required, but the data is expected to be a flat list of models.

### GroupingCollection ###

Extends the [ServerCollection](#Collects-ServerCollection), and thus is designed to conduct server-side paging, sorting, and filtering, but there are expected to be "groups" of models, i.e. grouped models by facility.

#### FetchOptions ####
```JavaScript
// in addition to the options supported in ServerCollection
var fetchOptions = {
  groupKey: FullScreenColumns[0].groupKey, // data attribute to group with
  groupName: FullScreenColumns[0].name
};
```

#### Functions ####
- **getTotalItems**: returns length of all items in all groups of models
- **isEmpty**: returns true if either `collection.length` is 0 or `getTotalItems` is 0
- **setGrouping(grouping)**: updates attribute to group on. Does not update groupings
- **serverSort(sortKey, options)**: in addition to the [`ServerCollection.serverSort`](#Collections-ServerCollection), pass in `groupKey` to update attribute to group on, else will go to default/initial grouping -- calls `setGrouping` with appropriate groupKey

#### Use Case ####

This collection should be used when server-side paging, sorting, and filtering is required, and the data is expected to be in the form of a list of groups of models.

### QueryBuilder ###

The QueryBuilder manages the generation of certain criteria sent with fetch requests. For example, the [ServerCollection](#Collections-ServerCollection) makes use of the QueryBuilder to maintain the logic for the date range, text filter, pagination, and sort order. The typical use case is just to access the criteria through the collection.

Example usage (as done in [ServerCollection](#Collections-ServerCollection)):
```JavaScript
initialize: function() {
  // this is a chained constructor that instantiates all supported criteria
  this.Criteria = new  QueryBuilder.Criteria();
  // example use, works in similar manner with all supported criteria types
  this.Criteria.Page.setPageSize(100);
  this.Criteria.Page.setMax(300);
},
fetch: function(fetchOptions) {
  // calls `getCriteria` for each criterion
  fetchOptions.criteria = this.Criteria.getCriteria();
  // ...
}
```

#### Criteria ####

When instantiated, instantiates all supported criteria. This is the recommended and most convenient way to manage criteria, as opposed to instantiating the criteria individually.

##### Attributes #####
On instantiation, sets the following attributes to the instantiated supported criteria. (accessible through `Criteria.<criterion>`)

- [**Query**](#Collections-QueryBuilder-Query): generic generator tailored for JDS formatted queries. Useful for queries not supported by other criteria below.
- [**Range**](#Collections-QueryBuilder-Range): used to set date range if 'range' is a supported field in the resource
- [**TextFilter**](#Collections-QueryBuilder-TextFilter): used to filter with multiple text filters against multiple fields
- [**Page**](#Collections-QueryBuilder-Page): used to maintain page state for pageable collections
- [**NoText**](#Collections-QueryBuilder-NoText): reduces data payload
- [**SortKey**](#Collections-QueryBuilder-SortKey): used to maintain sort order

##### Functions #####

- **Criteria.reset**: calls `reset` on all supported criteria
- **Criteria.getCriteria**: calls `getCriteria` on all supported criteria

#### Query ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.QueryBuilder()`

Query is a generic JDS query generator. There are functions such as `Query.between` that return a new query. Doing this does not add that query to the Query object. To do this, you should create the new query then pass it to `Query.add`.

##### Attributes #####

None that should be accessed. `_fields` is used internally to keep track of added queries (i.e. with `Query.add`), but should not be relied on.

##### Functions #####

- **Query.hasQueries**: returns true if queries were added using the `Query.add` function
- **Query.between(field, start, end)**: returns new 'between' query
- **Query.gte(field, value)**: returns new 'gte' (greater than or equal) query
- **Query.lte(field, value)**: returns new 'lte' (less than or equal) query
- **Query.or(firstQuery, secondQuery)**: returns new 'or' query, which is a combination of the first and second queries passed in separated by an 'or'
- **Query.and(firstQuery, secondQuery)**: returns new 'and' query, which is a combination of the first and second queries passed in separated by an 'and'
- **Query.in(field, array)**: returns new 'in' query, i.e. 'in(field,[array[0],array[1],..,array[X]])'
- **Query.not(query)**: returns new 'not' query, i.e. 'ne(field,query)'
- **Query.ne(field, query)**: returns new 'ne' query, i.e. 'in(field,[array[0],array[1],..,array[X]])'
- **Query.createClause(clause)**: creates new function at `Query[clause]` that receives 'field' and 'values' as parameter; function is a pass through to `Query.custom`. Returns false if the clause (string) specified already exists, i.e. 'between' or 'lte'
- **Query.custom(clause, field, values)**: returns new query using 'clause' as map to custom clause created using `Query.createClause`. No need to use this function, as calling `Query[clause](field, value)` is equivalent
- **Query.add(query)**: adds query to `_values` (i.e. will be returned by `Query.getCriteria`)
- **Query.clearFilters**: clears all queries added with `Query.add`
- **Query.dateFilter(field, start, end)**: returns date filter query. Returns a `Query.between` when 'start' and 'end' are strings, `Query.gte` when only 'start' is given, and `Query.lte` when only 'end'
- **Query.globalDateFilter(field)**: returns date filter query with 'start' and 'end' from the global date filter in Session (calls `Query.dateFilter` with these values)
- **Query.toString**: converts all queries added with `Query.add` into a string that can be used in the url. Returns string
- **Query.reset**: clears all queries added with `Query.add`
- **Query.getCriteria**: used when converting to criteria before fetch. Returns object with single string on 'filter' attribute. Single string is all queries added with `Query.add` stringified and concatenated together (using `Query.toString`)

#### Range ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.RangeBuilder()`

Range sets a date range criteria field, i.e. 'range={fromDate}..{toDate}'

##### Attributes #####

None that should be accessed. `isSet`, `_fromDate`, and `_toDate` are set internally to keep track of those respective values.

##### Functions #####

- **Range.setRange(fromDate, toDate)**: sets `_fromDate` and `_toDate` with given strings, and sets `isSet` to true
- **Range.createFromGlobalDate**: calls `Range.setRange` using 'fromDate and 'toDate' from global date filter
- **Range.toString**: returns `_fromDate` and `_toDate` as concatenated string separated by two periods, i.e. '{fromDate}..{toDate}'
- **Range.reset**: unsets `_fromDate`, `_toDate`, and `isSet`
- **Range.getCriteria**: returns range as an object with url-friendly string (uses `Range.toString`) set to 'range' attribute.

#### TextFilter ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.TextFilterBuilder()`

TextFilter allows for the creation and maintenance of multiple text filters against multiple fields, i.e. `filterFields=[{field1}, {field2},..,{fieldX}]` and `filterList=[{filter1},{filter2},..,{filterY}]`

##### Attributes #####

- `defaultValues` (array): set with `TextFilter.setDefaultValues`
- `defaultFields` (array): set with `TextFilter.setDefaultFields`

`_values` and `_fields` are used to keep track of the values and fields internally, and should not be accessed.

##### Functions #####

- **TextFilter.setDefaultValues(defaultValues)**: sets `defaultValues` taking in an array of strings
- **TextFilter.setDefaultFields(defaultFields)**: sets `defaultFields` taking in an array of strings
- **TextFilter.addTextValue(valueString)**: adds valueString to `_values`
- **TextFilter.addTextValues(valueArray)**: add each value in array to `_values`, calls `TextFilter.addTextValue` on each item in array
- **TextFilter.removeTextValue(valueString)**: removes valueString from `_values`
- **TextFilter.removeTextValues(valueArray)**: removes each value in array from `_values`, calls `TextFilter.removeTextValue` on each item in array
- **TextFilter.addField(fieldName)**: adds fieldName (string) to `_fields`
- **TextFilter.addFields(fieldArray)**: adds array of field names to `_fields`, calls `TextFilter.addField` on each item in array
- **TextFilter.removeField(fieldName)**: removes fieldName (string) from `_fields`
- **TextFilter.removeFields(fieldArray)**: removes array of field names from `_fields`, calls `TextFilter.removeField` on each item in array
- **TextFilter.clearTextValues**: clears `_values`
- **TextFilter.clearFields**: clears `_fields`
- **TextFilter.clear**: clears `_values` (calls `TextFilter.clearTextValues`) and `_fields` (`TextFilter.clearFields`)
- **TextFilter.resetValues**: resets values to those set with `TextFilter.setDefaultValues` (or empty array)
- **TextFilter.resetFields**: resets fields to those set with `TextFilter.setDefaultFields` (or empty array)
- **TextFilter.reset**: resets `_values` and `_fields` to defaults (calls `TextFilter.setDefaultValues` and `TextFilter.setDefaultFields`)
- **TextFilter.getFilterTextValues**: returns array of value strings
- **TextFilter.getFilterFields**: returns array of field strings
- **TextFilter.getCriteria**: used when converting to fetch-friendly format. Returns object with `filterList` (calls `TextFilter.getFilterTextValues`) and `filterFields` (calls `TextFilter.getFilterFields`) as attributes

#### Page ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.PageBuilder()`

Page maintains the page state for pageable collections (i.e. [ServerCollection](#Collections-ServerCollection) -- server paging).

##### Attributes #####

- `start` (integer): start index in collection, update with `Page.next`
- `limit` (integer): page size, update with `Page.setPageSize`
- `max` (integer): maximum number of items in collection. Used for `Page.hasNext`. Updated with `Page.setMax`

##### Functions #####

- **Page.setPageSize**: sets the `limit` to the provided value
- **Page.next**: called when collection should get next page. Updates `start` to provided next start index, or the previous `start` + `limit`
- **Page.setMax**: called when total number of items in collection is known (i.e. after initial fetch). Sets `max` with the provided value
- **Page.hasNext**: returns true if there is a next page. Checks if `start` is less than `max`
- **Page.reset**: sets `start` to 0, unsets `max`, and returns `limit` to default page size
- **Page.getCriteria**: used when converting to fetch-friendly format. Returns object with `start` and `limit` as attributes

#### NoText ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.NoTextBuilder()`

If NoText is enabled, reduces data payload (resource must support it)

##### Attributes #####

- `notext` (boolean): turns flag on/off, updated with `NoText.enable` and `NoText.disable`

##### Functions #####

- **NoText.enable**: sets `notext` to true
- **NoText.enable**: sets `notext` to false
- **NoText.getCriteria**: used when converting to fetch-friendly format. Returns object with `notext` as attribute

#### SortKey ####
Already instantiated by `QueryBuilder.Criteria()`

Alternative isolated instantiation: `QueryBuilder.SortKeyBuilder()`

Builds and maintains key that collection is sorted on

##### Attributes #####

- `default` (string): key to fall back to after reset, updated with `SortKey.setDefaultKey`
- `order` (string): current sort key, updated with `SortKey.setSortKey`

##### Functions #####

- **SortKey.setDefaultKey(defaultKey)**: sets `default` to defaultKey
- **SortKey.setSortKey(sortKey)**: sets `order` to sortKey
- **SortKey.reset**: sets `order` to `default`
- **SortKey.getCriteria**: used when converting to fetch-friendly format. Returns object with `order` as attribute

## Models ##
**`ADK.Models`** are Backbone model definitions with extended fetch mechanisms, as well as additional functionality depending on which collection is being used. **`ADK.Models`** should be the mechanism used to fetch and maintain domain data from the resource server, instead of the now deprecated ADK.ResourceService's and ADK.PatientRecordService's `fetchModel` functions.

**Note:** anything the BaseModel supports, the other models will also support as they will extend the BaseModel.

To see full options, see the sections below. An example usage (using BaseModel):

```JavaScript
var fetchOptions = {
  resourceTitle: 'my-resource-title-from-directory'
};
var myModel = new ADK.Models.BaseModel();
myModel.fetch(fetchOptions);
```
### BaseModel ###
The base model definition that the other models in **`ADK.Models`** will extend from. The 'save' and 'fetch' functions have been extended to generate the url from the ResourceDirectory, as well as apply patient information relevant to the fetch url if `patientData: true`.

#### Fetch ####

After instantiation (`var myModel = new ADK.Models.BaseModel()`), simply call 'fetch' with any attributes and fetch options to fetch a model from the server. [Fetch options are below](#Models-BaseModel-FetchOptions)

#### Save ####

After instantiation (`var myModel = new ADK.Models.BaseModel()`), simply call 'save' with any attributes and [fetch options](#Models-BaseModel-FetchOptions) to send a POST (first) or PATCH/PUT (subsequent) to the server:

#### FetchOptions ####

```JavaScript
// Available options, in addition to most xhr/Backbone.Model fetch options.
// Defaults shown where applicable.
var fetchOptions = {
  cache: true, // whether the fetch url and response will be cached
  patientData: false, // sends pid of current patient
  resourceTitle: 'my-resource-title-from-directory', // maps to ResourceDirectory
  allowAbort: true // if another fetch goes out, abort will be called
};
```

#### Use Case ####

This model type should be used for data fetches fetches or saves.

#### Parse Error Catching ####

Each parse call is wrapped in a try/catch and upon an uncaught error, the model will throw an 'error' event, which can be treated the same as a fetch error.

## ResourceService ##
RESOURCE SERVICE FETCHING NOW DEPRECATED, please transition to use [**`ADK.Collections`**](#Collections) and [**`ADK.Models`**](#Models)

> **ADK.ResourceService** is an application service that returns an object of functions that allows a developer to interact with the Software Development Kit's [Vista Exchange API][VXAPI].

Using ADK.ResourceService allows you to perform fetches against any domain listed in the [VX-API's Resource Directory][VXAPI].  New domains can be added to the Vista Exchange API through the SDK's [Resource Development Kit][RDK].

### Methods ###
**ADK.ResourceService.**[method below]

#### .fetchCollection(options) {.method .copy-link} ####
returns a Backbone Model of the requested resource
[(list of options)][ADK.RecordService.CommonOptions]
``` JavaScript
var data = ADK.ResourceService.fetchCollection({...});
```
#### .fetchModel(options) {.method .copy-link} ####
returns a Backbone Model of the requested resource
[(list of options)][ADK.RecordService.CommonOptions]
``` JavaScript
var data = ADK.ResourceService.fetchModel({...});
```
#### .fetchResponseStatus(options) {.method .copy-link} ####
returns a Backbone Model of the requested resource
[(list of options)][ADK.RecordService.CommonOptions]
``` JavaScript
var ResponseStatus = ADK.ResourceService.fetchResponseStatus({...});
```
#### .resetCollection(originalCollection, options) {.method .copy-link} ####
returns orginialCollection after a new fetch is called to update the collection's models
[(list of options)][ADK.RecordService.CommonOptions]
``` JavaScript
var data = ADK.ResourceService.fetchCollection({...});
    data = ADK.ResourceService.resetCollection(data, {...});
```
#### .filterCollection(originalCollection, filterFunction) {.method .copy-link} ####
returns the originialCollection after it is filtered by the filter function
``` JavaScript
var data = ADK.ResourceService.fetchCollection({...});
var filteredData = ADK.ResourceService.filterCollection(data, function(model) {
    if (typeof model.get('id') !== 'undefined') {
        return true;
    } else {
        return false;
    }
});
```
#### .buildUrl(resourceTitle, criteria) {.method .copy-link} ####
returns a resource's URL from VX-API's resource directory
``` JavaScript
var url = ADK.ResourceService.buildUrl('user-service-userinfo', {parameter1:'example'});
```
#### .buildJdsDateFilter(dateFilterOptions) {.method .copy-link} ####
returns a date filter string that is generated by dateFilterOptions
``` JavaScript
var dateFilter = ADK.ResourceService.buildJdsDateFilter({parameter1:'example'});
```
#### .clearAllCache(domainString) {.method .copy-link} ####
deletes all cached fetches from Backbone.fetchCache in the domain specified (if no domainString is specified, all cached data will be deleted)
``` JavaScript
ADK.ResourceService.clearAllCache('user-service-userinfo');
ADK.ResourceService.clearAllCache();
```
#### Common Options ####
The following are attributes that may be included in the **options** object parameter used in the following methods: **fetchCollection**, **fetchModel**, **resetCollection** (second parameter), and **fetchResponseStatus**.

| Attribute                | Type    | Description                                                                 |
|--------------------------|---------|-----------------------------------------------------------------------------|
| **resourceTitle**        | string  | resource title from VX-API's resource directory used to generate a url |
| **pageable**             | boolean | fetchCollection or resetCollection will return a Backbone.PageableCollection when _true_ |
| **collectionConfig**     | object  | collection config passed to constructor (see below for more details) |
| **viewModel**            | object  | view model object that contains a parse function that overrides the default model parse [(backbone documentation)][ModelParse] |
| **criteria**             | object  | key value pairs converted to query string parameters on fetch URL (see below for more details) |
| **cache**                | boolean | fetch from cache when _true_, bypass/expire cache when _false_. (default true) |
| **cacheExpiration**      | integer | cache expiration in seconds or _false_ for never expires.  (default 10 minutes) |

::: side-note
**Provided below is more details about common options for ADK.RecordService methods.**
##### collectionConfig {.option} #####
Available attributes for the collectionConfig object:

###### .collectionParse {.option} ######
function that receives a collection and returns an Object Array to override default collection parse.
```JavaScript
fetchOptions.collectionConfig = {
        collectionParse: function(collection) {
            return collection.where({
                summary: 'CHOCOLATE'
            });
        }
    };
```
##### criteria {.option} #####
Examples of possible criteria key - value pairs:

###### .filter {.option} ######
criteria option for passing JDS filter [(see JDS documentation for filter syntax)][RDK]
```JavaScript

criteria = {
  filter: 'lte(overallStart,"2013"),gte(overallStop,"2015")'
}

```
###### .sort {.option} ######
criteria option for passing JDS sort order
```JavaScript
criteria = {
  order: 'overallStop DESC'
}
```
###### .paging {.option} ######
(see resource directory for applicable resources)
```JavaScript
criteria = {
  paging: {
    'start': '0', //start showing results from this 0-based index
    'limit': '10' //show this many results
  }
}
```
:::
#### More Examples ####
The following is an example of fetching both a model and collection using ADK's ResourceService:
```JavaScript
define([
    "ADK",
    ...
], function (ADK, ...) {
    ...
    var fetchOptions = {
      cache: true,
      resourceTitle: 'some-resource-title', //resource title from resource directory
      viewModel: viewModel, //optional override of default viewModel
      pageable: true; //optional to return a Backbone.PageableCollection
      collectionConfig: { //optional
        collectionParse: function(collection) {
            return collection;
        }
      }
      criteria: criteria //optional criteria object gets converted to query string parameters on resource call
    };
    resourceCollection = ADK.ResourceService.fetchCollection(fetchOptions);
    resourceModel = ADK.ResourceService.fetchModel(fetchOptions);
});
```

## PatientRecordService ##
PATIENT RECORD SERVICE FETCHING NOW DEPRECATED, please transition to use [**`ADK.Collections`**](#Collections) and [**`ADK.Models`**](#Models) with `patientData: true`

> **ADK.PatientRecordService** acts similar to ADK.ResourceService except it allows you to fetch resources from the ResourceDirectory in regards to a particular patient by passing in a patient attribute as part of the options parameter.

### Methods ###
**ADK.PatientRecordService.**[method below]
#### .fetchModel(options) {.method .copy-link} ####
returns a Backbone Model of the requested resource
``` JavaScript
var PatientData = ADK.PatientRecordService.fetchModel();
```
##### Options #####
In addition to the attributes available in the [options](#ADK-Services-ResourceService) object of ADK's ResourceService, the following attributes may be included in the **options** object parameter used in this method.

| Attribute    | Type           | Description                                                                 |
|--------------|----------------|-----------------------------------------------------------------------------|
| **patient**  | Backbone Model | Model containing a patient's identifying attributes. When left undefined the application's currently selected patient model will be used |
##### More Example(s) #####
###### Providing Options ######
The following grabs the application's current patient's demographic record data.
::: showcode Show example
```
var fetchOptions = {
  'resourceTitle' : 'patient-record-patient',  //resource title from resource directory
  'onSuccess': function(){
    // Alert others that the data is back ?
  }
};

var patientModel = ADK.PatientRecordService.fetchModel(fetchOptions);
```
:::
###### Fetch Data for a Specific Patient ######
The following grabs the demographic record data for a specific patient.
::: showcode Show example
```
var fetchOptions = {
  'resourceTitle' : 'patient-record-patient',  //resource title from resource directory
// Provide model of the patient you would like to receive the resource data on
  'patient' : Backbone.Model.extend({pid: "...."})
//
};

var patientModel = ADK.PatientRecordService.fetchModel(fetchOptions);
```
:::
#### .fetchCollection(options) {.method .copy-link} ####
returns a Backbone Collection of the requested resource
``` JavaScript
var PatientData = ADK.PatientRecordService.fetchCollection();
```
##### Options #####
In addition to the attributes available in the [options](#ADK-Services-ResourceService) object of ADK's ResourceService, the following attributes may be included in the **options** object parameter used in this method.

| Attribute    | Type           | Description                                                                 |
|--------------|----------------|-----------------------------------------------------------------------------|
| **patient**  | Backbone Model | Model containing a patient's identifying attributes. When left undefined the application's currently selected patient model will be used |
##### More Example(s) #####
###### Providing Options ######
The following grabs the application's current patient's medication record data.
::: showcode Show example
```
var fetchOptions = {
  'resourceTitle' : 'patient-record-med',  //resource title from resource directory
  'onSuccess': function(){
    // Alert others that the data is back ?
  }
};

var medicationCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
```
:::
###### Fetch Data for a Specific Patient ######
The following grabs the medication record data for a specific patient.
::: showcode Show example
```
var fetchOptions = {
  'resourceTitle' : 'patient-record-med',  //resource title from resource directory
// Provide model of the patient you would like to receive the resource data on
  'patient' : Backbone.Model.extend({pid: "...."})
//
};

var medicationCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
```
:::
#### .getCurrentPatient() {.method .copy-link} ####
returns a Backbone Model of the currently selected patient
``` JavaScript
var currentPatientModel = ADK.PatientRecordService.getCurrentPatient();
```
#### .setCurrentPatient(patient, options) {.method .copy-link} ####
Triggers [Messaging](#Messaging) event `'context:patient:change'` and passes through **patient** and **options**. The **patient** parameter should be either a pid string or model with patient data already defined on it. The **options** parameter should be in object format. For more documentation on applicable options, please refer to applet documentation for any applet listening to the `'context:patient:change'` Messaging event.
``` JavaScript
ADK.PatientRecordService.setCurrentPatient('SITE;149');
```
``` JavaScript
ADK.PatientRecordService.setCurrentPatient(PATIENT_MODEL);
```

#### .refreshCurrentPatient() {.method .copy-link} ####
updates the current patient model in session with the latest data associated with the current site the user is logged into.

#### .getRecentPatients(collection) {.method .copy-link} ####
returns a Backbone Collection of recently selected patient models. The _optional_ `collection` argument allows the patient models to be set on an existing collection rather than a new Backbone Collection. The collection argument is generally used to refresh an existing collection of recent patients.
``` JavaScript
var currentPatientModel = ADK.PatientRecordService.getRecentPatients();

var recentPatientsCollection = ADK.PatientRecordService.getRecentPatients();
// The collection can be updated by passing in the collection as an argument.
ADK.PatientRecordService.getRecentPatients(recentPatientsCollection);
```

#### .fetchResponseStatus(options) {.method .copy-link} ####
returns HTTP response status from the fetch call (does not return a model or collection)
``` JavaScript
var ResponseStatus = ADK.PatientRecordService.fetchResponseStatus();
```
##### Options #####
In addition to the attributes available in the [options](#ADK-Services-ResourceService) object of ADK's ResourceService, the following attributes may be included in the **options** object parameter used in this method.

| Attribute    | Type           | Description                                                                 |
|--------------|----------------|-----------------------------------------------------------------------------|
| **patient**  | Backbone Model | Model containing a patient's identifying attributes. When left undefined the application's currently selected patient model will be used |

### Events ###
ADK's PatientRecordService exposes a few events for hooking into it's functionality.
All PatientRecordService events are fired on [ADK's global messaging channel][ADK.Messaging].
| Event Type                | Description                                                                         |
|---------------------------|-------------------------------------------------------------------------------------|
| **refresh.ehmp.patient**  | This event is fired immediately when the `refreshCurrentPatient` method has been called. |
| **refreshed.ehmp.patient**| This event is fired when the updated data has finished being set on the patient model in session. |

## CCOWService ##
> **ADK.CCOWService** is an application service that handles CCOW (Clinical Context Object Workgroup) context for the application. In short, it allows the application to navigate to a specific patient when other connected applications do the same. The service provides functionality to connect to the CCOW vault, listen for updates to the context and push context updates.

### Methods ###
**ADK.CCOWService.**[method below]

#### .start(callback) {.method .copy-link} ####
Initializes and attaches the CCOW ActiveX control to the service.  Sets pertinent CCOW session information as well. The callback is executed with one parameter, an error string. If the error string is undefined, CCOW was initialized successfully.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **callback** | function | Callback that is executed upon completion with an error code parameter |

#### .getTokenFromContextItems() {.method .copy-link} ####
Returns the VistA context token from the current context

#### .getDfnFromContextItems() {.method .copy-link} ####
Returns the DFN value from the current context

#### .getDivisionFromContextItems() {.method .copy-link} ####
Returns the division value from the current context

#### .persistCcowSession(ccowModel) {.method .copy-link} ####
Persists the given CCOW Backbone Model into session storage.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **ccowModel** | Backbone model | Backbone model with CCOW session properties set (Notably 'reinitialize' and 'status') |

#### .getSiteInfo(callback) {.method .copy-link} ####
Calls the authentication resource to obtain current site information. On success, it matches the site returned to the current context's site. A callback is executed with the site if they match.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **callback** | function | Callback that is executed with an error object (property 'error' that contains the error message) or the matched site |

#### .getPid(patient) {.method .copy-link} ####
Returns the dfn part of the pid property from the passed in patient

#### .handleContextChange(patient, callback) {.method .copy-link} ####
Pushes a context change from this application to the CCOW vault. It updates the context with all applicable information from the patient parameter. If the context push is successful, the CCOW session object will show 'Connected' in the status property. If it fails, the status will be 'Disconnected'.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **patient** | Backbone model | Patient model that will be pushed to the context |
| **callback** | Backbone model | Callback that is executed regardless of success or failure. Check the status property of the session object for success/failure information |

#### .updatePatientInfo() {.method .copy-link} ####
Checks the currently selected patient in the application and compares it to the current patient in the context. If they are different, it calls [ADK.PatientRecordService.setCurrentPatient] to prompt the user to confirm the new context patient.

#### .formatPatientNameForContext(name) {.method .copy-link} ####
returns a patient name that is properly formatted so it can be inserted into the context

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **name**     | string |  Patient name |


#### .suspendContext(hideNotification) {.method .copy-link} ####
Suspends the application from the vault context. This means that it will no longer react to changes in the context until reconnected. The session status property will be set to 'Suspended'.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **hideNotification**     | boolean |  If set to true, the default growl notification will not appear when the context is suspended |

#### .resumeContext() {.method .copy-link} ####
Reconnects the application to the current context. If connected successfully, the .updatePatientInfo() function is invoked.

#### .updateCcowStatus(status, callback) {.method .copy-link} ####
Updates the CCOW session status with the given parameter string.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **status**     | string |  Status property value to update in the session |
| **callback**     | string |  Callback executed upon completion of the function |

#### .getCcowStatus() {.method .copy-link} ####
Returns the current status from the CCOW session object. If the browser is not IE or the session is undefined, false is returned.

#### .ccowIconSwitch(event, ccowAction) {.method .copy-link} ####
Opens an alert dialog allows the user to suspend or resume their participation in the context based on the given ccowAction parameter. If ccowAction is 'Disconnected', the user is prompted to break the link otherwise they are prompted to resume participation.

##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **event**     | string |  Browser event that is passed along when clicking the button |
| **ccowAction**  | string |  Action to take (Usually 'Disconnected' or 'Connected') |

#### .quit() {.method .copy-link} ####
Suspends the current application session from the context. This should be called when a user session is ending.

## UserService ##
> **ADK.UserService** is an application service that returns an object of functions that allows a developer to retrieve and update information about the current user.

### Methods ###
**ADK.UserService.**[method below]

#### .getUserSession() {.method .copy-link} ####
returns a Backbone Model from [SessionStorage](#SessionStorage) with data attributes of current user.
[(list of options)][ADK.RecordService.CommonOptions]
``` JavaScript
var userSession = ADK.UserService.getUserSession();
```
##### Response #####
The Following is an example output of what gets returned by _getUserSession()_:
```JavaScript
// ADK.UserService.getUserSession().attributes returns the following object:
  {
    "site": "SITE",
    "expires": "2015-02-26T19:53:36.301Z",
    "status": "loggedin",
    "disabled": false,
    "divisionSelect": false,
    "duz": {
        "SITE": "10000000227"
    },
    "facility": "PANORAMA",
    "firstname": "PANORAMA",
    "lastname": "USER",
    "permissions": [ ],
    "requiresReset": false,
    "section": "Medicine",
    "title": "Clinician",
    "provider": true,
    "infoButtonPanorama": "1.3.6.1.4.1.3768",
    "infoButtonKodak": "1.3.6.1.4.1.2000",
    "infoButtonSite": "www.somesite.com"
  }
```
#### .authenticate(userName, password, facility) {.method .copy-link} ####
authenticates against VX-API's Authentication resource with the provided credentials. Method returns a $.Deferred() promise. If successful at authenticating and setting the user session, promise.done() method will be called, otherwise promise.fail() method will be called with these [list of options][ADK.RecordService.CommonOptions].
``` JavaScript
function onSuccessfulLogin() {
    console.log("Successfully authenticated");
}
function onFailedLogin() {
    console.log("Failed to authenticate");
}

var authenticateUser = ADK.UserService.authenticate('JohnSmith', 'ExamplePassword', 'AAAA');
authenticateUser.done(onSuccessfulLogin).fail(onFailedLogin);
```
##### Parameters #####
| Attribute    | Type   | Description                                                                 |
|--------------|--------|-----------------------------------------------------------------------------|
| **userName** | string | The username to authenticate |
| **password** | string | The password to authenticate |
| **facility** | string | The Vista facility to authenticate against |

#### .clearUserSession() {.method .copy-link} ####
destroys the session of the current user both on the client side and resource side.
``` JavaScript
ADK.UserService.clearUserSession();
```
#### .hasPermission(permission) {.method .copy-link} ####
checks if the current user has the provided permission. Returns **true** if user has permission, otherwise will return **false**. [Handlebar helper available for use in template](#Handlebar-Template-Helpers-Has-Permission)
``` JavaScript
var hasPermissionBoolean = ADK.UserService.hasPermission('edit-patient-record');
if (hasPermissionBoolean) {
  console.log("User has permission to: Edit Patient Record");
} else {
  console.log("User does not have permission to: Edit Patient Record");
}
```
#### .checkUserSession() {.method .copy-link} ####
checks the user token's expiration to ensure the current user is still authenticated. Returns a _boolean_ where **false** indicates token/session is expired.
``` JavaScript
var isUserSessionAlive = ADK.UserService.checkUserSession();
if (isUserSessionAlive) {
  console.log("User is still active, and logged in.");
} else {
  console.log("User's session has ended!");
}
```
## WorkspaceContextRepository ##
> **ADK.WorkspaceContextRepository** is an application service that manages a repository of workspace contexts for patient, staff, and admin.

#### ADK.WorkspaceContextRepository.**currentContext** ####
- Returns a Backbone Model with data attributes of current *workspace* context.
    | Attribute                | Type    | Description                                                                |
    |--------------------------|---------|----------------------------------------------------------------------------|
    | **id** | string  | workspace context id. e.g. 'patient', 'admin', or 'staff' |

#### ADK.WorkspaceContextRepository.**currentWorkspace** ####
- Returns a Backbone Model with data attributes of current workspace.
    | Attribute                | Type    | Description                                                                |
    |--------------------------|---------|----------------------------------------------------------------------------|
    | **id** | string  | workspace id. e.g. 'overview' |

#### ADK.WorkspaceContextRepository.**currentWorkspaceId** ####
- Returns a String value of current workspace id.

## Navigation ##
> **ADK.Navigation** controls the screen change and route/URL update throughout the application.

### Navigation Methods ###
#### ADK.Navigation.**navigate(workspaceId)** ####
- Changes the Application's current screen to the provided screen/workspace and updates the browser's URL/route

  Example of navigating to the _"allergy-list"_ workspace:
  ```JavaScript
  ADK.Navigation.navigate("allergy-list");
  ```
  | Required                           | Attribute          | Type     | Description |
  |:----------------------------------:|--------------------|----------|-------------|
  | <i class="fa fa-check-circle"></i> | **workspaceId**    | string   | unique identifier |
  |  | **options** | object   | optional parameter |
  ::: showcode options example:
  ```
    {
        route: {
            trigger: true
        },
        extraScreenDisplay: {
            dontLoadApplets:    true   // Skip applet loading during screen module loading
            dontReLoadApplets:  true   // Skip update of content region
        },
        callback: function() {  // Run this callback before workspace is displayed on the browser
            console.log('Hi ADK!');
        }
    }
   ```

#### ADK.Navigation.**displayScreen(workspaceId)** ####
- Changes the Application's current screen to the provided screen/workspace but does **not** update the browser's URL/route (may want to use in a case where you don't want the provided screen/workspace change to be saved in the browser's history)

  Example of displaying the _"allergy-summary"_ workspace: workspace:
  ```JavaScript
  ADK.Navigation.displayScreen("allergy-summary");
  ```

### Navigation Checks ###
**DEPRECATED! PLEASE USE** [**ADK.Checks**](#Checks) **INSTEAD**

There are situations where the user should be warned or take an action before the workspace/screen is changed using either _ADK.Navigation_ or a browser refresh/change in url.  **Navigation Checks** allow a developer to register and unregister checks to a global collection at any time based on the business needs/requirements.  The collection of global checks is processed and executed once any navigation is triggered.

When a refresh is triggered on the browser or there is a change in the url that points to outside the application, the user will be presented a confirmation alert that includes all the registered navigation checks' _failureMessage_ as part of a disclaimer to the user.

::: side-note
**Example:** User starts a workflow that will write back to the server.  Before the user completes and saves the workflow on the client, an event is triggered to navigate to a screen where the in-progress workflow does not exist, which would cause the in-progress work to be lost.  If a navigation check is registered on start of the workflow, the navigation method will not complete until the registered check passes its condition to allow for navigation to continue, thus allowing the user the option to save or discard the changes. Upon completion of the workflow, this check can be unregistered and no interruption to the navigation method will occur (unless other checks have been registered).
:::

A **Navigation Check** is defined as a Backbone.Model with the following attributes:
| Required                           | Attribute          | Type     | Description |
|:----------------------------------:|--------------------|----------|-------------|
| <i class="fa fa-check-circle"></i> | **id**             | string   | unique identifier |
| <i class="fa fa-check-circle"></i> | **failureMessage** | string   | message to display to the user when the check fails <br/> _(ie. shouldNavigate returns false)_ |
| <i class="fa fa-check-circle"></i> | **shouldNavigate** | function | executes appropriate actions based on the workspace being navigated to <br/> **Important:** Must return `true` or `false` to indicate whether navigation should continue. <br/> _Note:_ the method is passed the following parameters: the name of the screen being navigated to and the config object used to register the navigation check |

::: showcode Naming standards for "id" attribute:

::: side-note
The "id" should be all lowercase separated by "-".
It should always begin with the applet's id followed by the action and brief description.

(`appletId`-`action`-`description`)

Example: "allergies-writeback-in-progress"
:::
::: showcode Example of registering a navigation check:
``` JavaScript
ADK.Navigation.registerCheck(new ADK.Navigation.PatientContextCheck({
    id: 'appletid-action-description-unique',
    failureMessage: 'This is a important message! Any unsaved changes will be lost if you continue.',
    shouldNavigate: function(screenName, config){
      //check to avoid navigation to the "demo-screen"
      if (screenName === "demo-screen"){
        return false;
      } else {
        return true;
      }
    }
}));
```
:::

#### ADK.Navigation.**registerCheck(model)** ####
- This method takes in a _navigation check_ model to register to the global collection and returns the instance of the model that was registered.

#### ADK.Navigation.**unregisterCheck(unique)** ####
- Takes in the "**id**" string or the whole model to determine which check to unregister from the global collection.  Once unregistered, navigation will no longer run the check.

::: definition
**Available Checks**

The following are common checks abstracted to the ADK for use throughout the application.

#### ADK.Navigation.PatientContextCheck ####
- Determines if the user is being taken away from the "patient" context.  If the user is navigating away from a patient context workspace to a different context, the navigation process will be ended and the user will be presented with a confirmation alert that includes the navigation check's _failureMessage_ as part of the disclaimer to the user.
- Below is an example of the alert that is presented to the user when trying to navigate away from a patient context workspace:
![PatientContextCheckAlert](assets/navigationCheck_PatientContextCheck.png "Example of Patient Context Check Alert Confirmation")

The table below displays the attributes to define when extending the _PatientContextCheck_.
| Required                           | Attribute          | Type     | Description |
|:----------------------------------:|--------------------|----------|-------------|
| <i class="fa fa-check-circle"></i> | **id**             | string   | unique identifier |
| <i class="fa fa-check-circle"></i> | **failureMessage** | string   | message to display to the user when the check fails <br/> _(ie. shouldNavigate returns false)_ |
|                                    | **onCancel**       | function | method gets called on click of the "Cancel" button inside the alert confirmation |
|                                    | **onFailure**      | function | method gets called once the check fails (before the alert pops up) |

**Important:** Do not overwrite the **shouldValidate** method on the _PatientContextCheck_.

**Note:** Follow same naming standards for **id** attribute as defined above.

:::
### Navigation Helper Tools ###

#### Obstruction #### 

A obstruction is a way to prevent users from interacting with the application for a short period of time.  It is useful when executing non blocking asynchronous code and you need to prevent the user from interacting with the application.

*Example: Workspace Navigation was converted to run on ticks, because of this the user had an opportunity to load a modal of an applet that is currently being destroyed. To prevent this from happening, the obstruction was placed on the screen before the process of destroying the applets container region, and then removed before the new applets are drawn*

*Note: Navigation between screens will automatically add and remove the obstruction, however it may be advantageous to manually add it before navigation starts, multiple obscure calls have no compounding affect*  
  
| Command                                  | Description                                                      |
|:----------------------------------------:|------------------------------------------------------------------|
| ADK.Messaging.trigger('obscure:content') | Adds an overlay onto the screen that prevents user interaction   | 
| ADK.Messaging.trigger('reveal:content')  | Removes the overlay                                              |


## Checks ##

> **ADK.Checks** enables custom logical interruptions in the user's workflow. An example of this would be stopping the user from navigating away from a screen when a form is in progress. This is achieved by registering logic traps and callbacks as models in the collection of checks which can be triggered at any time (please use responsibly)

Below is an example of how to register and run a simple check. Feel free to try it out in the browser's console. Obviously, it has no inherent value to the application. A list of predefined check model definitions are provided in the **Available Predefined Checks** section below.

```JavaScript
// should define a reusable class of checks with a common group and purpose
// i.e. a check to be run on navigation (group: 'navigation')
var MyCheck = ADK.Checks.CheckModel.extend({
  validate: function(attributes, validationOptions) {
    // validate is called by isValid, which is called
    // by ADK.Checks.run. Both `validate` and `isValid` are
    // predefined patterns in Backbone
    validationOptions = validationOptions || {};
    var myCustomOptions = validationOptions.options || {};
    if (myCustomOptions.shouldFail){
      return "My check failed!";
    }
  },
  defaults: {
    group: 'my-group',
    onInvalid: function(invalidOptions) {
      // ran after isValid returns false
      invalidOptions = invalidOptions || {};
      var checkConfig = invalidOptions.checkConfig;
      var onPassCallback = invalidOptions.onPass || function() {};
      var runCheckOptions = invalidOptions.options;
      if (confirm(checkConfig.failureMessage)) {
        // Hey, it's just an example! window.confirm returns true or
        // false depending on which button was pressed.
        // ADK.UI.Alert should be used for any popup interaction displayed
        // to the user
        ADK.Checks.unregister(checkConfig.id);
        ADK.Checks.run(checkConfig.group, onPassCallback, runCheckOptions);
      } else {
        console.log('User cancelled the action!');
      }
    }
  }
});
ADK.Checks.register(new MyCheck({
  id: 'example-id',
  label: 'Example',
  failureMessage: 'My example check has failed! Would you like to continue?'
}));
var myCheckOptions = {
  shouldFail: true
}
ADK.Checks.run('my-group', function(){
  // method to run after all checks pass
  console.log('My checks all passed! Now do something :)');
}, myCheckOptions);
```

### Check Model Definition ###
In the case that a new check model class need be defined, it it highly recommended to extend **ADK.Checks.CheckModel**, which is used as a base for all predefined checks. It is important to specify a **group** in order to have new instances of your check model definition run all together. Similarly, **validate** and **onInvalid** should also be specified since without **validate**, `isValid()` will return true, and if `isValid()` returns false, without **onInvalid** nothing will happen.

:::side-note
**validate** should be defined on the top-level of the model, while **group** and **onInvalid** should be defined under the model's `defaults` attribute.
:::

#### Group ####
The **group** attribute should be defined as a string under the models `defaults` attribute. This string is used to namespace and logically group multiple checks, and should be both concise and descriptive of the purpose of the group of checks.

Example group:

```JavaScript
var MyCheckModel = ADK.Checks.CheckModel.extend({
  // ... rest of definition
  defaults: {
    group: 'my-group'
    // ... rest of definition
});
```

#### Validate ####
The **validate** attribute should be defined as a function on the model and is run when the model's isValid function is called (See [Backbone isValid documentation](http://backbonejs.org/#Model-isValid)), which is called by ADK.Checks.run. If the check should fail, a string describing the failure should be returned. It receives two arguments: _attributes_ (attributes on the check model, passed in by isValid) and _validationOptions_ (object with additional options passed by ADK.Checks.run). The _validationOptions_ argument will receive **checkConfig** (attributes on the check model -- provided for consistency and convenience), **onPass** (method passed into ADK.Checks.run, in order to continue to the next check), and **options** (custom options passed into ADK.Checks.run, useful for the validation condition).

Example validate function:

```JavaScript
var MyCheckModel = ADK.Checks.CheckModel.extend({
  validate: function(attributes, validationOptions) {
    if (/*someCondition*/) {
      return "Some condition failed";
    }
  },
  // ... rest of definition
});
```

#### OnInvalid ####
The **onInvalid** attribute should by defined as a function on the model's `defaults` attribute, and is called when isValid (called by ADK.Checks.run) returns false. Any user interruption should be invoked in this callback. This function receives _invalidOptions_ (an object) as its only argument, which will receive **checkConfig** (attributes on the check model -- provided for consistency and convenience), **onPass** (method passed into ADK.Checks.run, in order to continue to the next check), and **options** (custom options passed into ADK.Checks.run, used primarily as an argument to chain).

:::side-note
Additional callbacks or options can be expected and passed into the instantiation of the check model upon registration. An example of this would be **onCancel**, which can then be used by the **onInvalid** function. This allows for extensibility of the onInvalid callback (i.e. avoid requiring new definitions of onInvalid for each instance). See example below.
:::

Example onInvalid:

```JavaScript
var MyCheckModel = ADK.Checks.CheckModel.extend({
  // ... rest of definition
  defaults: {
    onInvalid: function(invalidOptions) {
      invalidOptions = invalidOptions || {};
      var checkConfig = invalidOptions.checkConfig;
      var onPassCallback = invalidOptions.onPass || function() {};
      var runCheckOptions = invalidOptions.options;
      if (confirm(checkConfig.failureMessage)) {
        // it is important to unregister checks when done with them
        ADK.Checks.unregister(checkConfig.id);
        // since ADK.Checks.run stops and executes only the first failing check
        // the check callback should run the checks again in order to chain them.
        ADK.Checks.run(checkConfig.group, onPassCallback, runCheckOptions);
      } else {
        // otherwise, perform some other action, such as
        // hiding the ADK.UI.Alert view which should be used
        // instead of this window.confirm
        console.log('User cancelled the action!');
        // example of additional custom callback expected by this function
        if (_.isFunction(checkConfig.onCancel)) {
          checkConfig.onCancel();
        }
      }
    },
    // ... rest of definition
});
```

### Registration of Checks ###
#### ADK.Checks.**register(models)** ####
Adds the provided model(s) to the Backbone collection of checks. The **models** argument can be either a single Backbone model or array of models. The model(s) passed in should be instantiated with any options required by the check model definition used.

Upon instantiation, all check models require an **id** attribute (string, should be indicative of the originator), **label** (string, should be "pretty" title for originator), and **failureMessage** (string, used for message to user in the check model's chosen user interruption). See example below.

:::callout
**Note:** on initialize of any model extended from ADK.Checks.CheckModel, the _group_ attribute is appended to the _id_ attribute, separated by a '-' (hyphen). For example, given `id: 'my-originator'` and `group: 'my-group'`, the post-initialization id would be "my-originator-my-group"
:::

Example registration:

```JavaScript
// where MyCheck extends ADK.Checks.CheckModel
ADK.Checks.register(new MyCheck({
  id: 'example-id', // used to distinguish between checks
  label: 'Example', // used by ADK.Checks.getAllLabels -- which can be used by onInvalid
  failureMessage: 'My example check has failed! Would you like to continue?'
  // ^ used by onInvalid and ADK.Checks.getAllMessages
}));
```

:::side-note
**Registering Multiple Checks:** simply pass ADK.Checks.register an array of models. There is no need to specify different id's for each model passed since each id has the individual check's group appended to it.
:::


#### ADK.Checks.**unregister(id)** ####
Removes model(s) matched by **id** argument, which can be in one of the following formats: string (single id), array of strings (multiple ids), object with id and/or group (single or multiple ids), or the model(s) to be removed themselves (array for multiple). See the below example for examples of valid unregister formats.

Example unregister:

```JavaScript
var commonCheckOptions = {
  id: 'example-id',
  label: 'Example',
  failureMessage: 'My example check has failed! Would you like to continue?'
}
// where MyCheck extends ADK.Checks.CheckModel with group of 'my-group'
var MyOtherCheck = MyCheck.extend({
  defaults: _.defaults({
    group: 'my-other-group'
  }, MyCheck.prototype.defaults)
});
var myCheckInstance = new MyCheck(commonCheckOptions);
var myOtherCheckInstance = new MyOtherCheck(commonCheckOptions);
ADK.Checks.register([myCheckInstance, myOtherCheckInstance]);

// Given the above (two separate checks of different groups)
// the following methods of unregistration are valid
-------------------------------------------------
// removes both checks due to _.includes (id used for namespace)
ADK.Checks.unregister('example-id');
// removes only myOtherCheckInstance
ADK.Checks.unregister('example-id-my-other-group');
// removes both checks
ADK.Checks.unregister(['example-id-my-group','example-id-my-other-group']);
ADK.Checks.unregister({ // removes both checks
  id: 'example-id'
});
ADK.Checks.unregister({ // removes only myOtherCheckInstance
  id: 'example-id-my-other-group'
});
ADK.Checks.unregister({ // removes only myOtherCheckInstance
  id: 'example-id',
  group: 'my-other-group'
});
ADK.Checks.unregister({ // removes both checks
  id: 'example-id',
  group: ['my-group','my-other-group']
});
// removes only myOtherCheckInstance
ADK.Checks.unregister(myOtherCheckInstance);
// removes both checks
ADK.Checks.unregister([myCheckInstance, myOtherCheckInstance]);
```

### Execution of Checks ###

#### ADK.Checks.**run(group, onPass, options)** ####
Requires **group** (string, corresponds to relevant group) and **onPass** (function, post-check target action) parameters to be defined. The **options** parameter will be passed into the _validate_ and _onInvalid_ functions.


### Retrieval of Data From Checks ###
#### ADK.Checks.**getAllMessages(group)** ####
Returns all failure messages from the checks collection filtered on provided **group** argument (will return all failure messages if not specified).

Example:

```JavaScript
// with two checks registered in 'my-group'
var myGroupMessages = ADK.Checks.getAllMessages('my-group');
```

#### ADK.Checks.**getAllLabels(group, options)** ####
Designed to be used in onInvalid. Thus, only invalid checks' labels will be retrieved (determined by calling isValid). Retrieves labels from all checks filtered on **group** (string, should correlate to a group in use). Returns an array of strings. The **options** argument will be passed into the isValid call, and should be in object format. Specifying **exclude** (string, should match a check's id) as an attribute on the options object will cause that check's label to be excluded from the returned array.

Example:

```JavaScript
// Let's say this is inside an onInvalid and checkConfig has been defined
// ...
// this will return all active checks that are of group "my-group" and do not
// have the id of this check
var myGroupLabels = ADK.Checks.getAllLabels('my-group', {exclude:checkConfig.id});
```

#### ADK.Checks.**getFailingChecks(group, options)** ####
Designed to be used in onInvalid. Thus, only invalid checks will be retrieved (determined by calling isValid). Retrieves all checks filtered on **group** (string, should correlate to a group in use). Returns an array of models. The **options** argument will be passed into the isValid call, and should be in object format. Specifying **exclude** (string, should match a check's id) as an attribute on the options object will cause that check's label to be excluded from the returned array, while specifying **getAttribute** (string, should correlate to an attribute on the check models, i.e. "label") will return an array of values corresponding to the values at the specified attribute on each matching check's model. NOTE: when **getAttribute** is specified, an object will be returned with **checks** (array of models) and **targetAttribute** (array of values from matching checks), instead of just an array of models.

Example:

```JavaScript
// Let's say this is inside an onInvalid and checkConfig has been defined
// ...
// this will return all active checks that are of group "my-group" and do not
// have the id of this check
var myGroupLabels = ADK.Checks.getFailingChecks('my-group', {exclude:checkConfig.id, getAttribute: 'label'});

```

### Available Predefined Checks ###
The below are predefined checks provided for different workflow points.
- Navigation
- Visit Context

#### Navigation ####
Available at **ADK.Navigation.PatientContextCheck** and triggered by **ADK.Navigation.navigate**. Upon failure, displays an alert which contains all other failing navigation checks. Upon confirming the alert, will unregister and run the **onContinue** for each failing check.

:::definition
Provided configuration:
- **group:** `'navigation'`
- **validate:** fails if target screen is outside of patient context
- **onInvalid:** presents user with alert displaying _failureMessage_ which upon "Continue" unregisters check and continues navigation. Also allows the following callbacks to be defined when initializing the check model:
  - **onCancel:** function fired in alert's "Cancel" click event.
  - **onContinue:** function fired in alert's "Continue" click event.
  - **onFailure:** function fired when alert is displayed.

Example registration:

```JavaScript
var checkOptions = {
    id: 'example-writeback-in-progress',
    label: 'Example',
    failureMessage: 'Example Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
    onContinue: _.bind(function(model) {
        form.workflow.close();
    }, form)
};
ADK.Checks.register(new ADK.Navigation.PatientContextCheck(checkOptions));
// Note: the id ends up being the provided id, plus the group
// so for the above check, the id is 'example-writeback-in-progress-navigation'
// To unregister:
ADK.Checks.register('example-writeback-in-progress');
```
:::

#### Visit Context ####
Available at **ADK.Checks.predefined.VisitContextCheck** and triggered by a change in patient visit context. Upon failure, displays an alert which contains all other failing visit context checks. Upon confirming the alert, will unregister and run the **onContinue** for each failing check.

:::definition
Provided configuration:
- **group:** `'visit-context'`
- **validate:** always fails. In other words, if you're registered, the onInvalid will fire.
- **onInvalid:** presents user with alert displaying _failureMessage_ which upon "Continue" unregisters check and continues to the next check. Also allows the following callbacks to be defined when initializing the check model:
  - **onCancel:** function fired in alert's "Cancel" click event.
  - **onContinue:** function fired in alert's "Continue" click event.
  - **onFailure:** function fired when alert is displayed.
:::

Example registration:

```JavaScript
var checkOptions = {
    id: 'example-writeback-in-progress',
    label: 'Example',
    failureMessage: 'Example Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
    onContinue: _.bind(function(model) {
        form.workflow.close();
    }, form)
};
ADK.Checks.register(new ADK.Checks.predefined.VisitContextCheck(checkOptions));
// Note: the id ends up being the provided id, plus the group
// so for the above check, the id is 'example-writeback-in-progress-visit-context'
// To unregister:
ADK.Checks.register('example-writeback-in-progress');
```

## Messaging ##

> **ADK.Messaging** allows for global-scope eventing to facilitate a variety of functionality, such as applet to applet communication and global date range eventing.

#### ADK.**Messaging** ####
- The global Backbone.Radio channel [Backbone.Radio docs][BackboneRadio]

```JavaScript
ADK.Messaging.on("<someGlobalEvent>", function(...) {...});
// OR ('this' being a view)
this.listenTo(ADK.Messaging, "<someGlobalEvent>", function(...) {...});
```

#### ADK.Messaging.**getChannel(channelName)** ####
- returns a private channel specific to communications directed towards the _channelName_
- example case would be to have a channel for a specific applet (see code example below)

```JavaScript
var someAppletChannel = ADK.Messaging.getChannel('<AppletID>');
// These are two examples of using Backbone.Radio's handlers and trigger methods
someAppletChannel.request("<someAppletRequest>", optionalParameter);
someAppletChannel.comply("<someCommandName>", function(...) {...});
```
::: side-note
Be sure to read the docs ([**Backbone.Radio**][BackboneRadio]) to understand all of the differences between events, requests, and commands. For instance, you can have many listeners for a given _event_ on a given channel, but only _one_ listener for a given _command_ on a given channel (registering a new listener for command B on channel A will overwrite any previous listener for command B on channel A).
:::

The following is an example of setting up listener to a date change.
```JavaScript
/*
 * First the date change event should be registered through ADK.Messaging, this time in date picker:
 */

// "this" = the event-triggering/date-picker view
this.model.set({
    fromDate: fromDate,
    toDate: toDate
});
// Note the model being served up to whomever subscribes to the event.
// Also note that no channel is being requested, so scope is global.
ADK.Messaging.trigger('date:selected', this.model);
```
```JavaScript
/*
 * Then the listener is set up, this time in an applet view:
 */

// "this" = the applet view
var self = this;
// note: listenTo is being used so that when the view is destroyed the eventListener is destroyed as well, ".on" should be used if the the listener needs to persist
this.listenTo(ADK.Messaging, 'date:selected', function(dateModel) {
    ... // Do something

    // ie. Below would execute the applet view's dateRangeRefresh function
    self.dateRangeRefresh('date');
});
```

The following is an example of setting up listener to receive a config:
```JavaScript
/*
 * First the reply needs to be set up.
 */

var appletConfig = {
  'configAttribute1': 'test Attribute Value',
  'configAttribute2': 'generic Attribute Value'
};
// getting channel so as not to be global scope
var configChannel = ADK.Messaging.getChannel('getAppletConfig');
// when this request is made, send this reply to the first requester on this channel
configChannel.reply('config:request', appletConfig);
```
```JavaScript
/*
 * Then the request is made:
 */

var configChannel = ADK.Messaging.getChannel('getAppletConfig');
// request made on same channel as the appropriate reply.
var receivedAppletConfig = configChannel.request('config:request', function(config){
  return config;
});
receivedAppletConfig.get('configAttribute1');
```
**Note:** the request/reply pattern is used when only **one** requester should get a reply

### Requests ###
**ADK.Messaging.request('**[key below]**')**

Requests are used when asking for a very specific thing to occur or for receiving a flat value like an object or boolean. For more information on `.request()` read the [**Backbone.Radio**][BackboneRadio] documentation.

The ADK has set up a reply handler for each of the following request keys below.

#### ehmpConfig {.method .copy-link} ####
returns a Backbone Model that holds centrally managed application configurations served from the ehmp config resource.  The ehmp configuration supports environment specific configurations that may be configured in a data store or infrastructure repository.

The following is an example of calling the request.
  ```JavaScript
  ADK.Messaging.request('ehmpConfig');
  ```
  The attributes object of the Backbone Model that is returned to the requester looks similar to the following:
  ```JavaScript
  {
    "featureFlags": {
      "trackSolrStorage": false
    }
  }
  ```
  You can access configurations like "featureFlags" or nested ones like "trackSolrStorage" in the following manner:
  ```JavaScript
  var ehmpConfig = ADK.Messaging.request('ehmpConfig');
  var featureFlags = ehmpConfig.get('featureFlags');
  var trackSolrStorageBoolean = _.get(featureFlags, 'trackSolrStorage');
  ```
  **Note:** The requester is provided with a Backbone Model but its attributes are frozen, so calling `.set()` on the model will not affect the model's attributes or values.

## Errors ##
`ADK.Errors` mainly consists of a [central collection of errors](#Errors-Collection). When catching an error, an error can be added to this collection by calling [`ADK.Errors.collection.add`](http://backbonejs.org/#Collection-add) in a manner similar to below:

```JavaScript
if (!obj.someRequiredAttribute) {
  ADK.Errors.collection.add({
    message: 'Specific applet/view: someRequiredAttribute not found.', // 'message' is required
    details: ADK.Errors.omitNonJSONDeep(obj, 'myObj', {})
    // 'details' is optional, omitNonJSONDeep scrubs values to be more friendly when value is saved to server,
    // useful to avoid JSON parsing errors.
  });
}
```
### Collection ###
Backbone.Collection that gathers and sets information when a model is added, done with the `parse` function.

#### Adding a New Error ####
On add of a new error (AKA a new Backbone.Model), the model parse sets certain additional information, such as some route information and timestamp. The collection parse also ensures that each model has a `message` attribute, and if not, removes it from the collection and throws an error in the console.

**`message`** is the only required attribute, and is used as the `idAttribute` for each model. In other words, a message of "An error has occurred." will only be represented by one unique error in the collection, while "My Applet/View 1: An error has occurred." will be that much more unique. Please note that the value of `message` is also visible to the user, so it is important to avoid any technical details. Utilizing `ADK.ErrorMessaging.getMessage(errorCode)` for the main content of the message is advised, as this returns a standardized message.

**`details`** is an optional attribute that is meant to be used as a vehicle for any additional information that might be useful for context of the error, generally some arguments of the function that the error is found in. Other helpful content may be some resource response options, applet configuration, or view options. Scrubbing the contents of `details` with [`omitNonJSONDeep`](#Errors-Util-Functions-omitNonJSONDeep-sourceObject--keyString--targetObject-) is advised, as the model can eventually be sent to the server.

### Util Functions ###
#### omitNonJSONDeep(sourceObject, keyString, targetObject) {.method .copy-link} ####
`omitNonJSONDeep` recursively scrubs an object or array of non-JSON-friendly values, such as functions. Returns `targetObject` with scrubbed copy of `sourceObject` set to attribute of `keyString`. Utilizes [`ADK.Errors.isJSONFriendly`](#Errors-Util-Functions-isJSONFriendly-item-) for type checking. Example:

```JavaScript
// try in the console
var options = {
  view: new Backbone.Marionette.ItemView({ model: new Backbone.Model({ a: true }) }),
  values: [{
    id: 'val1',
    value: 1,
    getValue: function() {
        return 1;
    },
    props: { cool: true }
  }, {
    id: 'val2',
    value: 2,
    getValue: function() {
        return 2;
    },
    props: { cool: false }
  }]
};
JSON.stringify(options);
// Uncaught TypeError: Converting circular structure to JSON
JSON.stringify(ADK.Errors.omitNonJSONDeep(options, 'options', {}));
// "{"options":{"values":[{"id":"val1","value":1,"props":{"cool":true}},{"id":"val2","value":2,"props":{"cool":false}}]}}"
// Note that view and getValue are omitted from targetObject
```

**Note:** `omitNonJSONDeep` mutates `targetObject`, which means that multiple child objects can be set on `targetObject`.
Example:

```JavaScript
// try in console
var obj1 = {a: [{b:true}]};
var obj2 = {a: [{b:false}]};
var details = {};
ADK.Errors.omitNonJSONDeep(obj1, 'obj1', details);
ADK.Errors.omitNonJSONDeep(obj2, 'obj2', details);
JSON.stringify(details);
// "{"obj1":{"a":[{"b":true}]},"obj2":{"a":[{"b":false}]}}"
```

#### isJSONFriendly(item) {.method .copy-link} ####
`isJSONFriendly` checks if `item` is of a JSON friendly type, and returns boolean. Note that it does not check the types of its child attributes in case of an object/array. Thus this function is best used recursively, as [`omitNonJSONDeep` does](#Errors-Util-Functions-omitNonJSONDeep-sourceObject--keyString--targetObject-). Examples:

```JavaScript
// try in the console
ADK.Errors.isJSONFriendly(false) // true
ADK.Errors.isJSONFriendly({ a: false }) // true
ADK.Errors.isJSONFriendly(new Error('My error')) // false
ADK.Errors.isJSONFriendly({ error: new Error('My error') }) // true
ADK.Errors.isJSONFriendly([1, 2, 3]) // true
ADK.Errors.isJSONFriendly([new Error('My first error'), new Error('My second error')]) // true
ADK.Errors.isJSONFriendly(function() {return;}) // false
ADK.Errors.isJSONFriendly({ func: function() {return;} }) // true
```

### Try/Catch Approach ###
#### Function.prototype.try(thisBind, args) {.method .copy-link}
Wraps `function.apply(context, args)` in a try/catch. `args` can be either in .apply or .call format (array/arguments vs simple list of args). `function.onError` can be defined which will be called in the catch. The 'onError' will receive the `error` and `args` passed to the apply. This approach can be used to add errors to [ADK.Errors.collection](#Errors-Collection) (already used to wrap most Backbone/Marionette life-cycle events and callbacks).

Example:
```JavaScript
// try in console
var testFunc = function() {
  var myFunctionToTry = function(stringArg) {
    // try this with and without `notHereVariable`,
    // to see it work with error and without error
    console.log('in myFunc', stringArg, notHereVariable);
  };
  myFunctionToTry.onError = function(error, args) {
    console.warn('Error calling myFunc', error, args);
  };
  // can treat like .call
  myFunctionToTry.try(this, "Try this on for size");
  // can also treat like .apply
  myFunctionToTry.try(this, arguments);
};
testFunc('test string');
```

## SessionStorage ##
### ADK's Session Object ###
This refers to the in-memory object that gets used to persist the changes to the following models:
**user**, **patient**, and **globalDate**

::: definition
For **saving** data, ADK.SessionStorage _always_ defaults to saving the key/value pairs to both the in-memory object as well as the browser's session storage, unless explicitly stating a preference.

For **retrieving** data, ADK.SessionStorage _always_ defaults to using the in-memory session data, unless explicitly stating a preference and the key exists as part of ADK's Session models.

### **Note**: ADK's Session Object should only be transformed through the ADK.SessionStorage methods ###
:::

### ADK.SessionStorage.**set** ###
#### **sessionModel(key, value, preference)** ####
- Adds a key/value pair into the browser's Session Storage and sets the ADK's Session Object _(if applicable)_.
- method parameters:
  + **key** : unique identifier in session
  + **value** : backbone model to save in session
  + **preference** : (string) options: "sessionStorage" | "session" | null   (default: null)
    * when preference equals "sessionStorage" the ADK's Session Object will **not** be set
    * otherwise the key/value pair will get set into the ADK's Session Object if the key exists as one of [ADK's Session models](#SessionStorage-ADK-s-Session-Object).

The following is an example of calling the method and its expected response.
  ```JavaScript
  var userModel = new Backbone.Model({...});
  ADK.SessionStorage.set.sessionModel('user', userModel, 'session');
  ```
  The attributes of the userModel get stored in the browser's Session Storage as a JSON object. Example user object below:
  ```JavaScript
  user: {
    "facility": "PANORAMA",
    "firstname": "PANORAMA",
    "lastname": "USER",
    "permissions": [],
    ...
  }
  ```
  **Note:** The user model will also get set in ADK's Session object as a Backbone model since preference was set to _'session'_

#### **appletStorageModel(...)** ####
- Gets the browser's Session Storage object titled 'context
-appletStorage' (e.g. patient-appletStorage) and retrieves its object associated with the given _appletId_ (if _appletId_ is not an attribute of the appletStorage object, it will create a new blank object with _workspaceId
$appletId
_ as its key e.g. provider-centric-view$todo_list). Then the _key_ / _value_ pair will be used to add / update the _appletId_ object.

The following is an example of adding lab results specific data to Session Storage.
```JavaScript
ADK.SessionStorage.set.appletStorageModel('overview', 'lab_results', 'key1', 'value1', /* optional */ contextName);
```
The Browser's Session Storage will store the model value as a JSON object:
```JavaScript
patient-appletStorage: { // current context is 'patient' in this case.
  'overview$lab_results': {
    'key1': 'value1'
  }
}
```

### ADK.SessionStorage.**get** ###
#### **sessionModel(key, preference)** ####
- Gets the object associated with the _key_ from browser's Session Storage **unless** _preference_ is set to 'session' and the key exists as one of [ADK's Session models](#SessionStorage-ADK-s-Session-Object).

The following is an example of retrieving the user model from ADK's Session object.
```JavaScript
ADK.SessionStorage.get.sessionModel('user', 'session');
```

The following is an example of retrieving the user model from the browser's Session Storage.
```JavaScript
ADK.SessionStorage.get.sessionModel('user', 'sessionStorage');
```
**Note:** if the model is returned from ADK's Session object, it will respond to model events when ADK's Session model updates. Otherwise, a new Backbone Model with identical attributes will be returned.

#### **appletStorageModel(appletId)** ####
- Gets the browser's Session Storage object titled 'appletStorage', and retrieves and returns its object associated with the given _appletId_.

The following is an example of getting lab results specific data from Session Storage.
```JavaScript
ADK.SessionStorage.get.appletStorageModel('overview', 'lab_results', /* optional */ contextName);
```

**Note:** the model returned will be a new Backbone model that has attributes identical to those stored in the browser's Session Storage object.

### ADK.SessionStorage.**delete** ###
#### **sessionModel(key, setDefault)** ####
- Removes object associated with the given _key_ from ADK's Session object and the browser's Session Storage object. Specifying _setDefault_ to **true** will reset the ADK's Session model associated with the given _key_ to it's specified default values.

```JavaScript
// this one will reset the user model to its defaults
ADK.SessionStorage.delete.sessionModel('user', true);

// this one will completely delete all of patient's attributes from Session
ADK.SessionStorage.delete.sessionModel('patient');
```

#### **appletStorageModel(appletId)** ####
- Removes the object associated with the given _appletId_ from the appletStorage object in the browser's Session Storage object.

```JavaScript
ADK.SessionStorage.delete.appletStorageModel('lab_results');
```

#### **all()** ####
- Clears all attributes from browser's Session Storage object and removes user, patient, and global date models from ADK's Session models.

::: callout
This permanently clears out session until items are set again. In other words, this should not be used unless the user's workflow has ended, such as on logout.
:::

```JavaScript
ADK.SessionStorage.delete.all();
```

## ADK Utilities ##

The following are the available utilities that have been created thus far in the ADK.

### Collection Manipulation ###
**ADK.utils.**[method below]

#### .sortCollection(collection, key, sortType, ascending) {.method .copy-link} ####
- _collection_ - The collection to be sorted
- _key_ - The key to sort by
- _sortType_ - Alphabetical, Alphanumerical, Numerical
- _ascending_ - Boolean: True for sorting. False for reverse sorting

```JavaScript
sortCollection: function(collection, key, sortType, ascending) {
    ADK.utils.sortCollection(collection, key, sortType, ascending);
}
```
---
The following collection filters are available for convenience.  However, backbone collections have a built in filter method based on Underscore, [Underscore][underscoreFilterWebPage].

#### .filterCollectionByDays(collection, numberOfDays, dateKey) {.method .copy-link} ####
- _collection_ - The collection to be filtered
- _numberOfDays_ - The key to sort by
- _dateKey_ - the model key of the date field to filter on

#### .filterCollectionByDateRange(collection, startDate, endDate, dateKey) {.method .copy-link} ####
- _collection_ - The collection to be filtered
- _startDate_ - JavaScript Date object of Start range
- _endDate_ - JavaScript Date object of End range
- _dateKey_ - the model key of the date field to filter on

#### .filterCollectionBeginsWith(collection, key, filterValue) {.method .copy-link} ####
- _collection_ - The collection to be filtered
- _key_ - the model key of the field to filter on
- _filterValue_ - the string value to filter by

#### .filterCollectionByValue(collection, key, filterValue) {.method .copy-link} ####
- _collection_ - The collection to be filtered
- _dateKey_ - the model key of the field to filter on
- _filterValue_ - the string value to filter by

#### .resetCollection(collection) {.method .copy-link} ####
- _collection_ - The collection to be reset

### Date Utilities ###
**ADK.utils.**[method below]

#### .formatDate(date, displayFormat, sourceFormat) {.method .copy-link} ####
Returns a string that has been tranformed the given _date_ using the given _displayFormat_ and _sourceFormat_.

The following example would return '12252014'
```JavaScript
var date = '20141225';
date = ADK.utils.formatDate(date, 'MMDDYYYY', 'YYYYMMDD');
```


#### .getTimeSince(dateString, showMinutes) {.method .copy-link}  ####
Returns an object containing the attributes specified below. The timeSince attribute is calculated with the given _dateString_. If time elapsed is less than 1 hour timeSince will have the value '< 1h' unless _showMinutes_ parameter is set to **true**, in which case timeSince will be the actual number of minutes.

- timeSince : time elapsed since the given moment in time
- timeUnits : unit of time in which result is returned ('y': year, 'm': month, 'd': days, 'h': hours, '\'': minutes)
- count : the number of timeUnits since the given date
- timeSinceDescription : result in formatted string
- isRecent : is **true** if timeSince is less than 6 months

Example returned values:
```JavaScript
// this would be returned if the given dateString was 1 year ago
{
  timeSince: '1y',
  timeUnits: 'y',
  count: '1',
  timeSinceDescription: '1 Year',
  isRecent: false
}
```

#### .dateUtils.datepicker(selector, options) {.method .copy-link}  ####
Provides a standardized way to invoke the datepicker with masking utilizing the global convention for date formatting. The utility takes two arguments, the first of which is the reference to the input DOM element for which the datepicker and input masking is to be applied, and the second is an options object.

For example:
```JavaScript
var currentDateTime = new Moment().format(ADK.utils.dateUtils.defaultOptions().placeholder);
ADK.utils.dateUtils.datepicker(this.$('#myDateInput'), {
  'endDate': currentDateTime
});
//Should one need to retrieve options set against an element...
var startDate = this.$('#myDateInput').data('dateUtilOptions').startDate;
```

Note in the above example that all configuration options can be retrieved with the options function call. Also note that the placeholder does not need to be explicitly set on the DOM element, but since this method expects and input element type, manual configuration is required for an icon to trigger the datepicker.

```JavaScript
$('#myDateInput').parent().find('.glyphicon-calendar').on('click', function() {
   $('#myDateInput').datepicker('show');
});
```

The following are the default options configured for both the datepicker and input mask. Start date defaults to the oldest date vista can accept. All datepicker or input mask options can be configured (please refer to each libraries documentation for more information).

```JavaScript
{
    format: 'mm/dd/yyyy',
    placeholder: 'MM/DD/YYYY',
    regex: /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/g,
    clearIncomplete: true,
    todayHighlight: true,
    endDate: new Moment().format('mm/dd/yyyy'),
    startDate: new Moment('01/01/1800').format('mm/dd/yyyy'),
    keyboardNavigation: false,
    onincomplete: function(e) { //Required to ensure model is sync'd to field
        $(this).val('').trigger('change');
    },
    inputmask: 'm/d/y'
}
```


### Miscellaneous Utilities ###
**ADK.utils.**[method below]

#### .extract(obj, expr, args) {.method .copy-link}  ####
The default response from the PatientRecordService is the VPR JSON format.  In many cases you may want to flatten or simplify the model for use in a view template.  The model is overridden by passing in an optional viewModel parameter including a new parse method to the PatientRecordService.

- _obj_ - object representing the response
- _expr_ - path expression
- _args_ - key value pairs in which the 'key' is used to assign a new param to response, and the 'value' is the name of the value being assigned to the new param.

```JavaScript
var viewModel = {
    parse: function(response) {
        if (response.reactions) {
            response = ADK.utils.extract(response, response.reactions[0], {reaction:"name"});
        }
        return response;
    }
};
```
#### .chartDataBinning(graphData, config) {.method .copy-link}  ####
The function is used to create binning data series for highchart.
::: side-note
**graphData** - The data for highchart
  ```JavaScript
   var graphData = {
                    series : [{dateTime, val}, ...]  // highchart seriea
                    oldestDate: dateTime        // oldest event
                    newestDate: dateTime        // newest event
                   }
   ```
**config** - the configuration for binning
  ```JavaScript
     var config = {
                      chartWidth:  100,           // chart width in pixels
                      barWidth:    5,             // width of chart bar   / 5 by default
                      barPadding:  2,             // padding between bars / 2 by default
                      normal_function : function(val) {return Math.log((val*val)/0.1);},
                                                  // data normalization function (optional)
                      debug: true                 // false by default
                     }
  ```
**returns** - new binned data series ([{datetime, value},....])
  ```JavaScript
      var config = this.options.binningOptions;
      var chartConfig = new EventGistGraph(this.model.get('graphData'));
      this.chartPointer = $('#graph_' + this.model.get('id'));
          if (config) {
              config.chartWidth = (this.chartPointer).width();
              chartConfig.series[0].data = Utils.chartDataBinning(this.model.get('graphData'), config);
          }
      this.chartPointer.highcharts(chartConfig);
  ```
:::

<br />

### CRS Highlight ###
Visual notification to the user of relationships in data when a is concept is selected and applied.

The originator for now is only the Condition/Problem domain.

In the appletsManifest file the applet that will display the highlight needs to have a property called 'crsDomain' that has one of the following values [Vital, Medication, Laboratory, Problem]

```JavaScript
  {
    id: 'vitals',
    title: 'Vitals',
    context: ['patient'],
    maximizeScreen: 'vitals-full',
    showInUDWSelection: true, //true to show up in User Defined Workspace Carousel
    permissions: ['read-vital'],
    crsDomain: ADK.utils.crsUtil.domain.VITAL
  }
```

If your applet is using any of the following domains [medication, laboratory, vital, problem] and it inherits from datagrid or baseDisplayApplet then the model only needs to have the following properties:

```JavaScript
  crsDomain: ADK.utils.crsUtil.domain.MEDICATION,
  codes: [{
            "code": "197518",
            "display": "Clindamycin 150 MG Oral Capsule",
            "system": "urn:oid:2.16.840.1.113883.6.88"
          }]
```

<b>The instructions below is only needed if the applet doesn't inherit from datagrid or baseDisplayApplet.</b>

When you call applyConceptCodeId() it will add dataCode on the model that was passed to it. You only need to make sure that the model you pass has the 'crsDomain' property defined:

```JavaScript

 crsDomain: ADK.utils.crsUtil.domain.MEDICATION, (the domain the resource is coming from)

```
You can use an ADK utility to get the following values:

```JavaScript
ADK.utils.crsUtil.domain.LABORATORY returns 'Laboratory'
ADK.utils.crsUtil.domain.MEDICATION returns 'Medication'
ADK.utils.crsUtil.domain.PROBLEM returns 'Problem'
ADK.utils.crsUtil.domain.VITAL returns 'Vital'

ADK.utils.crsUtil.applyConceptCodeId(model) accepts one parameter and returns an object
{
  dataCode:
}
```

<b>dataCode</b> comes from the codes array in the model based on the domain being used for that applet <br />

In the html there should be attributes called data-code on each row to be highlighted
```JavaScript
<div data-code="{{dataCode}}"></div>
```

<b>Removing CRS Highlighting</b>

To remove the current active CRS highlighting you need to pass the current view to the removeStyle() method. This function will remove the STYLE element from the page and also hide the CRS icons from the applet title bars.

```JavaScript

 ADK.utils.crsUtil.removeStyle(this);

 // NOTE: You can also access the STYLE element ID and CRS icon class names by doing the following:
 ADK.utils.crsUtil.getCssTagName();
 ADK.utils.crsUtil.getCrsIconClassName();

```

## Accessibility ##
### Skip Links ###
#### .SkipLinks {.method .copy-link} ####
SkipLinks are the collection of skip links for any given screen. When any are present, the [SkipLinkDropdown view](#Accessibility-Skip-Links--SkipLinkDropdown) will be shown. The pattern of adding a skip link to the collection when shown and removed from the collection when destroyed should be followed. This pattern allows for each screen to define the links while also avoiding any manifest-type lists to maintain. This pattern has been abstracted to the [SkipLinks behavior](ui-library/behaviors.md#SkipLinks). Using the behavior is the preferred manner to add and maintain skip links.

```JavaScript
// example usage
var MyView = Marionette.LayoutView.extend({
  template: Handlebars.compile('<div class="example-target-link-region">'),
  onRender: function() {
    ADK.Accessibility.SkipLinks.add({
      displayText: 'Example Skip Link Menu Item', // text displayed in dropdown, also used as model id
      focusEl: this.$('.example-target-link-region'), // element on which to set focus on click of menu item
      rank: 0, // non-negative integers, lower == higher place in collection (i.e. 0 would be first item),
      hidden: false, // if true, link will be omitted from the SkipLinkDropdown View
      focusFirstTabbable: true // if true, finds first focusable child element of `focusEl`
      // `focusFirstTabbable: true` is useful for when `focusEl` is not focusable
      // if `focusFirstTabbable: false`, ensure the element is focusable
    });
  },
  onDestroy: function() {
    ADK.Accessibility.SkipLinks.remove('Example Skip Link Menu Item');
  }
});
```

#### .SkipLinkDropdown {.method .copy-link} ####
Dropdown view that shows list of [skip links](#Accessibility-Skip-Links--SkipLinks). On focus of skip link, the associated `focusEl` will be visually highlighted to help make it clear where the element resides on the screen. On click of skip link, focus is set to the associated element.

```JavaScript
// example usage
myView.showChildView('exampleRegion', new Accessibility.SkipLinkDropdown({
  collection: ADK.Accessibility.SkipLinks
}));
```

[adkSourceCode]: https://code.vistacore.us/scm/app/adk.git
[ehmpuiSourceCode]: https://code.vistacore.us/scm/app/ehmp-ui.git
[standardizedIdeWikiPage]: https://wiki.vistacore.us/display/DNS RE/Team+Standardized+IDE+for+JavaScript+Development
[workspaceSetupWikiPage]: https://wiki.vistacore.us/display/DNS RE/Creating+DevOps+workspace+environment
[sublimeWebsite]: http://www.sublimetext.com/3
[sublimeSettingsWikiPage]: https://wiki.vistacore.us/x/RZsZ
[adkBuildJenkins]: https://build.vistacore.us/view/adk/view/Next%20Branch/
[bsCSS]: http://getbootstrap.com/css/
[bsComponents]: http://getbootstrap.com/components/
[bsJQ]: http://getbootstrap.com/javascript/
[backboneWebPage]: http://backbonejs.org/
[marionetteWebPage]: https://github.com/marionettejs/backbone.marionette/tree/master/docs
[requireJsWebPage]: http://requirejs.org/
[amdWebPage]: http://requirejs.org/docs/whyamd.html
[handlebarsWebPage]: http://handlebarsjs.com/
[underscoreFilterWebPage]: http://underscorejs.org/#filter
[BackboneRadio]: https://github.com/marionettejs/backbone.radio
[sass]: http://sass-lang.com/
[VXAPI]: vx-api/
[RDK]: /rdk/index.md
[ModelParse]: http://backbonejs.org/#Model-parse
[ADK.Messaging]: using-adk.md#ADK-Messaging
[ADK.RecordService.CommonOptions]: using-adk.md#ResourceService-Methods-Common-Options