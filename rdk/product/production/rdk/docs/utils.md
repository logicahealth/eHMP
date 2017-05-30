::: page-description
Utilities
=========
:::

## Overview
Utilities are responsible for helping code reuse and maintainability:
 * Processing a patient data object to return to the client
 * Performing the processing for subsystems and/or resources

## Developing a Utility

A minimal example utility which complements this guide and the style guide can be found at `/product/production/rdk/src/utils/timer/`  
_(Note that all utilities should be hyphenated and all lowercase as explained in the [code organization section](code-organization.md).)_

### Before you create a utility
 * Ensure that it does not already exist
 * Identify the potential for reuse in the future
 * Understand that proper [logging](logging.md) is very important and how to use logging properly.

### Create the utility file(s)
 * Identify the correct location to place the utility
    * All utilities belong in /product/production/rdk/src/utils/
    * Closely-related utilities which belong to similar domains and which have similar scaling profiles should be placed in an overarching directory

The convention of creating a utility file is:  
`/utils/(functionality)/(functionality).js`  
where the functionality is a dash-separated identifier.  
For example, given a utility to track and log timing on an external call or for loop execution:  
`/utils/timer/timer.js`

## Common Utilities
 * [RdkError](utils.md#RdkError) 
 * [Timer](utils.md#Timer)
 * [Http Wrapper](http-wrapper.md)

### RdkError
This utility allows for a standard way to log an error and then return errors to the client.

The RdkError accepts 3 parameters
 * `options`: (string|Object) - String containing a code or message and other options
 * `options.code`: (string) - String representing the ['service-name'|'service-number'].['http-error-code'].['constant-number']
     * **example**: 'rdk.500.1002' corresponds to `/utils/errors/constants/rdk-error-constants.json` under the 500 objects 1002 item
 * `options.error`: (Error) - **optional** A caught Error instance to pass in for logging
 * `options.status`: (string) - **optional** The status
 * `options.message`: (string) - **optional** The message
 * `options.logger`: (Object) - **optional** The request logger if you desire the Error to be logged immediately. 
     * You can also send this as a parameter later when you call RdkError's log function
 * `fileName`: (string) - **optional** The file name
 * `lineNumber`: (string|Number) - **optional** The line number

#### Key functionality
::: side-note
RdkError will attempt to establish any error, message and status properties based on the `code`, `message`, `status` & `error` objects included in the `options` parameter
:::

 * RdkError tracks that it's logged an error so that rdkSend will not log it again later, but you can call log as many times as you want.
 * RdkError calls its sanitize function when sending the Error data back to the client to only include the whitelisted properties so that the client does not have access to things like the error, fileName and lineNumber properties for security purposes.
 * RdkError log needs the req.logger bunyan instance in order to properly log the error.

#### Example
```JavaScript
var RdkError = require('../path/to/rdk').utils.RdkError;

function handle(error, result) {
    if (error) {
        var errorObj = new RdkError({
            'error': error, // the caught error for logging
            'code': 'vista.401.1005', // this code determines the status and message
            'logger': req.logger // log the error immediately with this logger
        });
        // if we hadn't sent logger as a parameter rdkSend would log it for us later
        // additionally you could call errorObj.log(req.logger);
        // instead of adding the logger in the constructor object
        return res.status(errorObj.status).rdkSend(errorObj);
    }
    // ... other awesome code when no error
}
```

### Timer
This utility allows for a standard way to log timing execution for external requests and long running code portions.

The Timer accepts 1 parameter:
 * `params`: (Object)
 * `params.name`: (string) - **optional** A name to track the timer logs
 * `params.roundTo`: (string) - **optional** An integer representation of the digits of accuracy you expect the milliseconds to round to
 * `params.start`: (boolean) - **optional** A boolean to tell the timer to start or not
 * `params.format`: (boolean) - **optional** A boolean to tell the timer to format the stop and start times in the default moment utc format

#### Key functionality
 * Timer can start at creation if you send start: true as a parameter. Start can be called on the Timer instance later.
 * Timer can be stopped without logging and logged at a later time by calling Timer.stop.
 * Timer log needs the req.logger bunyan instance as its first parameter in Timer.log. Additionally you can send parameters to stop, but calling log will stop the timer for you.
    * Timer logs a small object at an info level

#### Example
```JavaScript
var RdkTimer = require('../path/to/rdk').utils.RdkTimer;

function handle(error, result) {
    if (error) {
        //... do something with error and return
    }
    var exampleTimer = new RdkTimer({
        // a useful and unique name helps to identify this timer's log lines
        'name': 'Sith Lord',
        'start': true // makes the timer automatically start
    });
    // exampleTimer.start(); // call this if the timer was not created with start: true
    _.each(result.items, function(resultItem) {
        // .. do some very long running stuff
    });
    exampleTimer.log(logger, {
        'stop': true
    }); // this will stop and log the Timer instance.
}
```

<br />
---
Next: [Subsystems](subsystems.md)
