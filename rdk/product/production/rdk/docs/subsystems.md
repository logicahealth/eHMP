::: page-description
Subsystems
==========

Subsystems are services provided by the RDK to resources.  
Subsystems may be used within the RDK framework itself as well.
:::

Use subsystems to enable writing [DRY](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code. In other words, use subsystems to provide functionality to resources or other parts of the RDK which may be useful in multiple places.

## Available Subsystems
 * `asu` - Authorization/Subscription Utility
 * `jds` - JSON Data Store
 * `jdsSync` - General Synchronization (connects to both JDS and VX-Sync)
 * `pjds` - Persistent JDS
 * `enterpriseOrderable`
 * `favoriteOrderable`
 * `orderset`
 * `quickorder`
 * `authorization` (pep) - Policy Enforcement Point
 * `mvi` - Master Veteran Index
 * `patientrecord`
 * `solr`
 * `vistaReadOnly`
 * `vxSync`

Conditionally enabled subsystems:
 * `email` - only enabled if configured

Conditionally registered subsystems:
 * `cds` - Clinical Decision Support
 * `jbpm` - Java Business Process Model
 * `pcmm` - Primary Care Management Model
 * `vix` - Vista Imaging eXchange
 * `vistaMultidivision`

Unregistered subsystems:
 * `beanstalk`
 * `clinicalObjects`

## Subsystem Configuration

### Subsystems without configuration
 * `asu`
 * `authorization` (pep)
 * `clinicalObjects`
 * `quickorder` - uses `pjds`
 * `orderset` - uses `pjds`
 * `favoriteOrderable` - uses `pjds`
 * `enterpriseOrderable` - uses `pjds`
 * `vistaReadOnly`

### Subsystem configuration detail
Subsystems that use a request.js configuration object must have the `baseUrl` property set to the root URL of the server.

 * `jds`
    * `config.jdsServer` - request.js configuration object
 * `jdsSync`
    * `config.jdsServer` - request.js configuration object
 * `solr`
    * `config.solrServer` - request.js configuration object
 * `patientrecord`
    * `config.jdsServer` - request.js configuration object
 * `mvi`
    * `config.mvi` - request.js configuration object
    * `config.mvi.search.path` - the root HTTP path to the MVI resource
 * `vxSync`
    * `config.vxSyncServer` - request.js configuration object
 * `pjds`
    * `config.generalPurposeJdsServer` - request.js configuration object
 * `email`
    * `config.emailTransport` - subsystem registered if defined
    * `config.emailTransport` - nodemailer 1.x configuration object
 * `vistaMultidivision`
    * `config.enableMultidivisionProxyHealthcheck` - subsystem enabled if true
    * `config.vistaSites` - array of VistA configuration objects
 * `vix`
    * `config.vix` - subsystem registered if defined
    * `config.vix` - request.js configuration object
 * `jbpm`
    * `config.jbpm` - subsystem registered if defined
    * `config.jbpm.baseUrl` - base URL to JBPM
    * `config.jbpm.apiPath` - HTTP path to JBPM
    * `config.jbpm.healthcheckEndpoint` - part of the path after apiPath to the JBPM healthcheck
     * `config.jbpm.adminUser.username`
     * `config.jbpm.adminUser.password`
 * `pcmm`
    * subsystem registered if `jbpm` is registered
 * `cds`
    * registered if any of these is defined:
        * `config.cdsInvocationServer`
        * `config.cdsMongoServer`
    * `config.externalProtocol` - (incorrectly used - code needs updating)
    * `config.cdsMongoServer.host`
    * `config.cdsMongoServer.port`
    * `config.cdsMongoServer.username`
    * `config.cdsMongoServer.password`
    * `config.cdsMongoServer.options` - formatted query string options
    * `config.cdsMongoServer.rootCert` - path to root certificate
    * `config.cdsInvocationServer.host`
    * `config.cdsInvocationServer.port`

## Developing a Subsystem
Subsystems are developed similarly to resources.

The JDS subsystem located at `/product/production/rdk/src/subsystems/jds/jds-subsystem.js` is a good example subsystem. Use this to complement the reading below.
A simpler example subsystem can be found at `_example/example-subsystem.js` in the subsystems folder.

### Before you create a subsystem
 * Ensure that it does not already exist
 * Identify the already-existing utilities that can help you create your subsystem instead of reinventing the wheel

### Create the subsystem file
 * Identify the correct location to place the subsystem
    * All subsystems belong in /product/production/rdk/src/subsystems/
    * Each subsystem may have its own subdirectory. Consider extending the functionality of or adding another function to an existing subsystem if what you want to create is similar.

 * The convention of creating a subsystem file is:
    * `/subsystems/(functionality)/(functionality)-subsystem.js`
    * where the functionality is a dash-separated identifier.  
 * For example, the JDS subsystem file is:
    * `/subsystems/jds/jds-subsystem.js`

### Create the subsystem configuration
 * The resource server will register the configuration of the subsystem with the system.
 * The subsystem configuration can currently specify [Healthcheck](#Healthchecks) information about the subsystem.
 * Other subsystem functions are simply exported through `module.exports`.

The subsystem configuration object is obtained by the resource server through an exported function called `getSubsystemConfig`, which is passed an instance of the server object. `getSubsystemConfig` returns an object which may contain healthcheck information.

### Create the subsystem functions
**Do not block IO**; always use asynchronous functions instead. Consider using the [HTTP wrapper](http-wrapper.md) to send HTTP requests to external systems.

### Register the subsystem
Edit the `registerAppSubsystems` function in `app-factory.js`, following this example:
```JavaScript
var fooSubsystem = require('../subsystems/foo/foo-subsystem');
app.subsystems.register('foo', fooSubsystem);
```
Where `foo` names the item of functionality that the subsystem exposes, like jds or solr.

### Document the subsystem
 * Ensure that [JSDoc](style-guide.md#JSDoc-Guidelines) is written where applicable

### Test the subsystem
 * Write [unit tests and integration tests](testing.md) where applicable.

## Healthchecks
Healthchecks (health checks) allow monitoring of subsystem statuses, which is useful for subsystems that connect to outside network resources.

Healthcheck objects must contain the following items:
 * `name`: The name of the healthcheck, following the same naming conventions as resource names
 * `interval`: The interval in milliseconds of how frequently to run the health check. The currently recommended value is 5000 (5 seconds).
 * `check`: A function which performs an asynchronous healthcheck and calls the callback upon completion. The callback currently takes either a `true` or a `false` to indicate whether the check was healthy.

See the JDS subsystem healthcheck as an example.

<br />
---
Next: [Middleware](middleware.md)
