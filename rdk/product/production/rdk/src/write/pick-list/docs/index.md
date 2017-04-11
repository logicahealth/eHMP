::: page-description
Pick-List Introduction
======================
:::

## Overview
 * The pick-list framework retrieves data from VistA via RPC's.
 * The data is cached for a configurable amount of time.
 * The first time a small pick-list is called, it is in a non-cached state
    * The RPC will be called
    * The data will be cached
    * The data will then be returned to the caller
 * Large pick-list's are different
    * When the system first starts up, the RPC will be called
    * The data will be cached
    * The data will then be in a cached state ready to be returned to the caller
 * When the data becomes stale (i.e. the configured time has lapsed)
    * Small pick-list's will call the RPC directly, update the cache, and return the data.
    * Large pick-list's will return the stale data and then load and update the cache in the background.
 * Some pick-list's cannot be cached due to them containing a user supplied searchString.
    * These will be direct RPC calls.
  
An overview with sequence diagrams can be found at: [Pick-List In-Memory Solution](https://wiki.vistacore.us/display/VACORE/Pick-List+In-Memory+Solution)


## developer notes
You are required to use the code generation utility when generating new pick-lists (see below).

Pay particular attention to the warnings on this page "Warning about the way you pass parameters to RPC calls": [VistaJS - Calling Vista-RPCs via Javascript](https://wiki.vistacore.us/display/VACORE/VistaJS+-+Calling+Vista-RPCs+via+Javascript)

You can use CPRS to see how these RPC's are used: [How to trace RPC calls within CPRS](https://wiki.vistacore.us/display/VACORE/How+to+trace+RPC+calls+within+CPRS)

Descriptions of what RPC's are and the tools that can be used for working with them can be found [here](https://wiki.vistacore.us/display/VACORE/RPCs).

Make sure you watch this [video](https://wiki.vistacore.us/display/VACORE/How+Pick+List+service+makes+RPC+Calls).  Some of the contents may be old as to where we group things but the overview will still give you a great idea of how development happens (especially the overview of CPRS).


## pick-list endpoints
The list of RPC's for which pick-list endpoints exist can be found [here](https://wiki.vistacore.us/display/VACORE/RPCs+to+call+for+pick+lists)


## pick-list code generation utility
There is a [Pick-List CodeGeneration Utility](https://wiki.vistacore.us/display/VACORE/Pick-List+CodeGeneration+Utility) which you are required to use to create new pick-lists.
This will generate 4 source files:  
    *-fetch-list.js  
    *-parser(-object).js - '-object' is appended if param5 is 'true'  
    *-parser(-object)-spec.js - '-object' is appended if param5 is 'true'  
    *-fetch-list-itest-spec.js).  
Once generated, you must update  
config/pick-list-config-direct-rpc-call.json  
 OR  
config/pick-list-config-in-memory-rpc-call.json  
 with the call to them.  
 
The generated source will have TODO statements in them directing you on what needs to be replaced in the 4 generated files.  
Make sure you remove these TODO statements after you have changed your code.

### There are 6 different types of RPC calls that we've ran into so far.
For a detailed explanation of these, see [RPC Data Formats we've run into so far](#RPC-Data-Formats-we've-run-into-so-far) below for more detail.

 * `standard` - for RPC calls that take no extra parameters
 * `search-string` - same as standard but adds searchString (requiring 3 or more characters) to rpc call
 * `field-validation` - for RPC calls that need parameters passed to them
    * similar to search-string but for all the different types of params (boolean, String, numbers, etc)
 * `recursive` - for RPC calls that only return 44 results at a time
    * The will be called repeatedly until the entire list is retrieved (could take minutes to populate these large pick lists).
 * `categories-tilde` - for RPC calls that return data as categories and sub-categories
    * Top level categories are known because they start with a ~ character
    * (see medication-order-defaults-parser.js in our source code)
 * `categories-field-length` - for RPC calls that return data as categories and sub-categories
    * Top level categories are known by the number of fields they have.
    * (see allergies-match-parser.js in our source code)

##RPC Data Formats we've run into so far
 * regular style RPC data
    * lines of data contain a `\r\n`.
    * fields (within those lines) are separated by a `^`.
    * An example would be 'ien^name' such as '4762^ACETAMINOPHEN SUSP,ORAL'
    
    
 * categories-tilde style RPC data

The data returned will have one of 4 delimiters on the beginning of the line:

    ~category
    i+delimited string
    d+delimited string
    t+string

    category - only has one entry on the line after the tilde and that is the name of the category.  
    i - This is a regular line of data with fields separated by a '^'
        it is added to the 'values' array in the order in which it is encountered.
    d - This is a default line of data with fields separated by a '^'
        it is added to the 'default' value.
        There can only be one default.
    t - This is a text line
        it is added to a variable called 'text' and put in the 'values' array in the
        order in which it is encountered.
 
 * categories-field-length style RPC data
    * The data returned has categories assigned based on the number of fields on that line.

## Utility Code for pick-lists
###rpc-categories-tilde-transformer.js
This class is for working with RPC's that return data as categories and sub-categories
using a tilde character to indicate something is a top level category.

####rpc-categories-tilde-transformer.js CONSTANTS
A category entry can be one of the following values:

 * `CATEGORY_REGULAR_ENTRY` - This is a regular entry in the values array.
 * `CATEGORY_DEFAULT_ENTRY` - This is a text entry added to the values array.
 * `CATEGORY_TEXT_ENTRY` - This is a default entry (there is only one of these).

####rpc-categories-tilde-transformer.js Utility Methods
 * `isCategoryEntry` - Returns true if the fields array passed in has only one entry in it and that entry starts with a tilde. 
 * `validateCategoryArraySize` - Validates that the size passed in is the length of the array.
 * `addCategoryRegularEntry` - categoryEntry will be pushed to the values array that is contained in the last entry in retValue.
 * `addCategoryTextEntry` - The first entry in fields will be added to a variable called text and will be pushed to the values array that is contained in the last entry in retValue.
 * `addCategoryDefaultEntry` - categoryEntry will be pushed to a variable called default in retValue.

###rpc-util.js
 * `standardRPCCall` - Calls a VistA RPC and returns the data.  parameters can be zero or more arguments.
 * `removeExistingEntriesFromRPCResult` - This method is used for the `recursive` strategy to remove duplicate records.
    It will compare the records in arrFromRPC to the records in arrExistingEntries.
    If it finds any duplicates, it will not include the duplicate in the results returned.
 * `convertBooleanToYN` - Converts a boolean value to the characters 'Y' or 'N' as the RPC needs those specific characters to work.
 * `removeEmptyValues` - Removes all empty strings from the given array

###validation-util.js
 * `isWholeNumber` - Because lodash treats NaN as a number, we need a way to ensure that the value passed in is not only a number but that it is not a floating value.
 * `isStringNullish` - Checks to see if value is null, empty, or is not a String.  If any of those are true, this will return true.
 * `isStringLessThan3Characters` - After calling isStringNullish, this will validate that there are at least 3 characters in that String (some RPC calls require at least 3 characters).

## pick-list Naming Conventions
 * The name of the folder in ./rdk/write will be the name of the area the RPC deals with: ex. medications
 * The URI will be populated in pick-list-resources.js (or ./pick-list/config/pickListConfig.json)
 * The URI will be what they append to type= in POSTMAN [See wiki documentation for RPCs to call for pick lists] (https://wiki.vistacore.us/display/VACORE/RPCs+to+call+for+pick+lists)
 * The name of all files will start with the URI: ex. a medication-orders URI would be medication-orders-fetch-list.js
    * URI-NAME-fetch-list.js
    * URI-NAME-fetch-list-itest-spec.js
    * URI-NAME-parser(-object).js
    * URI-NAME-parser(-object)-spec.js
 * If the object returned from the parser is a single object, then '-object' should be appended to the name.  If it's an array of objects (more common), no additional info should be appended.
 * The method name in fetch-list.js files will be `fetch`
 * The method name in parser.js files will be `parse`
 
## pick-list Coding Conventions
 * All new pick-list's should use the [code generation utility](https://wiki.vistacore.us/display/VACORE/Pick-List+CodeGeneration+Utility)
  to create all new code.
 * Each fetch-list.js file should have a corresponding itest-spec.js file.
 * Each fetch-list.js file should have a corresponding parser(-object).js file.
 * Each parser(-object).js file should have a corresponding parser(-object)-spec.js file.
 * Validation of parameters passed in should be performed in the fetch-list.js
 * If a field isn't used in the parsed data, it should be documented that we aren't using it (for clarity).

## pick-list Integration Testing Conventions
 * A test should handle the happy path scenario
 * All known variations of formatting of data should be tested if the data can be returned in a different format (ex. errors, zero results, etc).
 * Tests should validate passing in invalid data for parameters

## pick-list Testing unit tests
The purpose of unit tests is to ensure the variable names do not change when a refactor happens (doesn't stop search/replace changes).
Thus, you can grab a sample of data coming from an RPC call and a sample of what the data was parsed to and create the unit test last using those 2 pieces of data.

## pick-list Documentation Conventions
 * The parser.js file should have example RPC data populated in the Javadoc of the parse method.
 * Each function called from the parse method in parser(-object).js should show examples of what the RPC data is that they parse.
 * In ./pick-list/docs you should put in a file with the name of the RPC containing everything you can discover about the RPC (ex. parameters it takes, examples pulled from CPRS, screenshots of how it is used in CPRS, google search the RPC and put anything you find there as well.)
 * Update the [wiki](https://wiki.vistacore.us/display/VACORE/RPCs+to+call+for+pick+lists) with information about your endpoint, how to call it, the data the RPC returns, the json you return, etc.

## pick-list Path to Follow when Developing
When working with RPC's, you need to know what parameters need to be passed in as well as what the data is that is returned.
Usually the hardest part is knowing what the field represents when data is or isn't returned from it.
This is the path we follow when writing a new RPC.

 * Search our Wiki (for the RPC name)
 * Use CPRS to see how the RPC's are called [How to trace RPC calls within CPRS](https://wiki.vistacore.us/display/VACORE/How+to+trace+RPC+calls+within+CPRS)
 * Search Google (for the RPC name)
 * Reach out to team Triton for help
