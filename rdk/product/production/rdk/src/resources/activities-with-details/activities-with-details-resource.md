# Group Activities With Details

### Activity Details [GET {{{path}}}/instances{?mode}{&initiatedBy*}{&routes*}{&pid}{&pageSize}{&primarySortBy}{&secondarySortBy}{&filterText*}{&processDefinitionId}{&flagged}{&returnActivityJSONData}]

Get activity details

+ Parameters
	+ mode (enum[string], required) - Whether to return open, closed, or all activities
		+ Members
            + `open`
            + `closed`
            + `all`

	+ initiatedBy: `SITE;10000000272,SITE;10000000271` (string, optional) - Activity initiated by user. Supports multiple comma separated values or multiple parameters.

	+ routes: `facility:SITE,team:1113,team:1114` (string, optional) - Activity route by team or facility. Supports multiple comma separated values or multiple parameters. Only one facility route is supported and one or more team routes.

		Pattern: `(team\:)|(facility\:)`

	:[pid]({{{common}}}/parameters/pid.md required:"optional")

        Patient Identifier

	+ start (number, optional)
		+ Default: `0`

	+ limit (number, optional)
		+ Default: `100`

	+ primarySortBy: `activity.patientName ASC` (string, optional) - Requires processDefinitionId

	+ secondarySortBy: `activity.state DESC` (string, optional) - Requires processDefinitionId

	+ filterText (string, optional) - Text filter on indexed fields. Supports multiple comma separated values or multiple parameters

	+ processDefinitionId: `Order.DischargeFollowup` (string, optional)

	+ flagged (boolean, optional)
		+ Default: `false`

	+ returnActivityJSONData (boolean, optional)
		+ Default: `false`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)
