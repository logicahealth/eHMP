JBPM Scripts
============
These are bash scripts meant to execute tasks against JBPM in an ad-hoc manner. Please read all documentation before attempting to execute a script.


discontinue-all-lab-orders.sh
-----------------------------
This script queries the supplied JBPM server for all running deployments, filters those deployments for Order deployments, and then sends a discontinue signal to each deployment so that it can end all process instances for Lab Orders.
The script will print out which deployment IDs it has signaled and the raw HTTP for each signal as returned by the JBPM API.

This script will re-use connection details supplied to it when calling the `get-deployments.sh` and `discontinue-lab-orders.sh` subscripts. Details of those scripts can be read below.

**Required** command line parameters:
* `-i` or `--ip` specifies the IP and port where the JBPM API is served in ip:port format eg. '127.0.0.1:8080'.
* `-u` or `--username` specifies the username that will be used to login to JBPM.
* `-p` or `--password` specifies the password that will be used to login to JBPM.


get-deployments.sh
----------------
This script will automatically be called by `discontinue-all-lab-orders.sh`.

This script will query the specified JBPM instance for all running JBPM deployments and generate a file named `deployments-results.txt`. This file can examined manually, but is automatically used by `discontinue-all-lab-orders.sh` to locate Lab Order deployments that may have running processes which need to be discontinued.
This script will operate only on the first 2000 deployments due to paging requirements on the JBPM API results.

**Required** command line parameters:
* `-i` or `--ip` specifies the IP and port where the JBPM API is served in ip:port format eg. '127.0.0.1:8080'.
* `-u` or `--username` specifies the username that will be used to login to JBPM.
* `-p` or `--password` specifies the password that will be used to login to JBPM.


discontinue-lab-orders.sh
-------------------------
This script will automatically be called by `discontinue-all-lab-orders.sh`.

This script will send a POST message to the specified JBPM instance to discontinue all lab process instances started by the supplied deploymentid.

The discontinue signal sent by the script is `urn:va:order-status:dc`.

**Required** command line parameters:
* `-d` or `--deploymentid` specifies the deployment ID of the JBPM deployment whose Lab process instances you want to discontinue.
* `-i` or `--ip` specifies the IP and port where the JBPM API is served in ip:port format eg. '127.0.0.1:8080'.
* `-u` or `--username` specifies the username that will be used to login to JBPM.
* `-p` or `--password` specifies the password that will be used to login to JBPM.
