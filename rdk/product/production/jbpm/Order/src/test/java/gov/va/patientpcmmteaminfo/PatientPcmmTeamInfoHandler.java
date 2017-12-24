package gov.va.patientpcmmteaminfo;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import org.jboss.logging.Logger;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import org.json.JSONObject;


public class PatientPcmmTeamInfoHandler implements WorkItemHandler, Closeable, Cacheable {

	private static final Logger LOGGER = Logger.getLogger(PatientPcmmTeamInfoHandler.class);

	@Override
	public void close() {
		// Ignored
	}

	@Override
	public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
		LOGGER.info("PatientPcmmTeamInfoHandler.abortWorkItem has been called");
	}

	@Override
	public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
		String response = null;
		
		try {
			LOGGER.info("Entering PatientPcmmTeamInfoHandler.executeWorkItem");
			String pId = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
			
			LOGGER.debug(String.format("PatientPcmmTeamInfoHandler.executeWorkItem pId = %s", pId));

			response = addMockPatientPcmmData();
			LOGGER.debug(String.format("PatientPcmmTeamInfoHandler.executeWorkItem response = %s", response));
		} catch (EhmpServicesException e) {
			response = e.createJsonErrorResponse();
			LOGGER.error(e.getMessage(), e);
		} catch (Exception e) {
			LOGGER.error(String.format("PatientPcmmTeamInfoHandler.executeWorkItem: An unexpected condition has happened: "+ e.getMessage(), e));
			response = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "PatientPcmmTeamInfoHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
		}
		
		WorkItemUtil.completeWorkItem(workItem, manager, response);
		
	}

	/*
	 * Add uId to JsonObject
	 *
	 *
	 */
	protected String addMockPatientPcmmData() {
		JSONObject jsonObj = new JSONObject();
		jsonObj.put("patientName", "TEST PATIENT" );
		jsonObj.put("patientICN", "TESTICN");
		jsonObj.put("teamId", "TESTID");
		jsonObj.put("teamName", "TESTNAME");
		jsonObj.put("pcpLastName", "TESTPCPLASTNAME");
		jsonObj.put("pcpFirstName", "TESTPCPFIRSTNAME");
		jsonObj.put("pcpMiddleName", "TESTPCPMIDDLENAME");
		jsonObj.put("pcpName", "TESTPCPNAME");
		String resultJson = jsonObj.toString();
		return resultJson;

	}

}
