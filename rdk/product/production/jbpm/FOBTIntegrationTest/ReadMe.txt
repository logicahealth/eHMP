Integration Test Notes
----------------------
This integration test runs within Eclipse. To run it:
1) 	Compile the two work item handler projects - FOBTLabService and CDSInvocationService. 
	From the directory where you copied their source code, run "mvn clean install". 
	This will create the jar files in your local Maven repository - normally ~/.m2/repository.
2) 	Copy the properties files - rdkconfig.properties or cdsconfig.properties - into /target/ directory of each respective project.
3) 	Run the FOBTServiceIntegrationTest as a jUnit test.
4) 	A successful run will display the following messages within the Console:
	FOBTService.executeWorkItem
	pollJDSResults
	getRDKurl
	RDK properties path: ~/Projects/vistacore/rdk/product/production/jbpm/FOBTLabService/target
	RDK URL: http://IP             /
	FOBT ServiceResponse: {"resourceType":"Bundle","type":"collection","id": ... }}}]}
	CDSInvocationServiceHandler.executeWorkItem
	CDSInvocationServiceHandler.invokeCDS
	CDS ServiceResponse: Abnormal

This test runs under Java 1.8
