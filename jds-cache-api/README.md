jds-cache-api
=============

A JDS Client using the cache.node database driver in networking mode


## Client usage

```
npm install jds-cache-api
const jdsCacheApi = require('jds-cache-api');
const jdsClient = new jdsCacheApi.JdsClient(logger, config);
```

## Internal development notes

ISC only provides a linux-compatible node module for cache.node, so testing must be run in a Linux environment.

You can make this easier to deal with by installing bindfs and running:

    mkdir -p ~/Projects/vistacore/.chef/vms/jds-cache-api
    bindfs ~/Projects/vistacore/jds-cache-api ~/Projects/vistacore/.chef/vms/jds-cache-api

This links the folder on the mac with the `/vagrant/jds-cache-api` folder in your VMs, so edits made in either place will be synced to the other place.

### Testing

`cd` into `/vagrant/jds-cache-api` or the location of this module first.

 * `npm test` to lint and unit test
 * `npm run test:int` to run integration tests. The default configuration uses the local development IPs.
    * Specify custom configuration with environment variables. Example:  
      ```
      VXSYNC_URL='http://IP           ' JDS_IP_ADDRESS='IP      ' JDS_USERNAME="$(echo -n "Programmer1" | base64)" npm run test:int
      ```
    * See the environment variables you can set in `tests/_environment-setup.js`

When writing tests, your test filenames must end with -spec.js or they will not be run.

Integration tests must have `require('./_environment-setup');` at the top of the file.

#### Manual testing

 * Run `./bin/jds-runner.js --help` for details on executing jds-client methods from the command-line
 * Run `./bin/pjds-runner.js --help` for details on executing pjds-client methods from the command-line
