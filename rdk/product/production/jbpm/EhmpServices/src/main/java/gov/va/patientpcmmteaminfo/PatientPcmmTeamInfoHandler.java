package gov.va.patientpcmmteaminfo;

import org.kie.api.runtime.Environment;
import org.kie.api.runtime.EnvironmentName;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;
import org.kie.internal.runtime.Cacheable;
import org.kie.internal.runtime.Closeable;
import org.springframework.http.HttpStatus;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

import org.hibernate.Session;
import org.hibernate.jdbc.ReturningWork;
import org.jboss.logging.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import gov.va.ehmp.services.exception.EhmpServicesException;
import gov.va.ehmp.services.exception.ErrorResponseUtil;
import gov.va.kie.utils.WorkItemUtil;
import gov.va.patientpcmmteaminfo.util.PcmmTeamInfoResourceUtil;

/**
 * calls rdk resource/patient/record/domain/demographics to get patienICN and then calls
 * PCMM.PCMM_API.get_patient_primary_care stored procedure to get patient team info
 *
 * @author sam.amer
 */
public class PatientPcmmTeamInfoHandler implements WorkItemHandler, Closeable, Cacheable {

    private static final Logger LOGGER = Logger.getLogger(PatientPcmmTeamInfoHandler.class);
    private KieSession ksession;

    @Override
    public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
        LOGGER.debug("PatientPcmmTeamInfoHandler.abortWorkItem has been called");
    }

    public PatientPcmmTeamInfoHandler(KieSession ksession) {
        this.ksession = ksession;
    }

    @Override
    public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
        String serviceResponse = null;

        try {
            LOGGER.debug("PatientPcmmTeamInfoHandler.executeWorkItem has been called");
            String pId = WorkItemUtil.extractRequiredStringParam(workItem, "pid");
            String patientICN = WorkItemUtil.extractRequiredStringParam(workItem, "patientICN");
            String siteCode = WorkItemUtil.extractOptionalStringParam(workItem, "siteCode");
            String stationNumber = WorkItemUtil.extractOptionalStringParam(workItem, "stationNumber");

            PcmmTeamInfoResourceUtil resUtil = new PcmmTeamInfoResourceUtil();
            String demographicsResponse = resUtil.invokeGetResource(pId);

            JSONObject responseObject = new JSONObject(demographicsResponse);
            JSONObject dataElement = responseObject.getJSONObject("data");
            if (dataElement != null) {
                JSONArray itemsArrayJson = dataElement.getJSONArray("items");
                int itemsArrayJsonSize = itemsArrayJson.length();
                if (itemsArrayJsonSize > 0) {
                    JSONObject jdsRecord = itemsArrayJson.getJSONObject(0);
                    String patientName = jdsRecord.getString("displayName");
                    if (!patientName.isEmpty()) {
                        serviceResponse = getPCMMTeamInfo(patientICN, siteCode, stationNumber, patientName);
                    } else {
                        serviceResponse = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "PatientPcmmTeamInfoHandler.executeWorkItem: Patient has no displayName", null);
                    }
                }
            }

        } catch (EhmpServicesException e) {
            serviceResponse = e.createJsonErrorResponse();
            LOGGER.error(e.getMessage(), e);
        } catch (Exception e) {
            LOGGER.error(
                    String.format("PatientDemographicsHandler.executeWorkItem: An unexpected condition has happened: "
                            + e.getMessage(), e));
            serviceResponse = ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "PatientPcmmTeamInfoHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage());
        }

        WorkItemUtil.completeWorkItem(workItem, manager, serviceResponse);
    }

    /**
     * calls PCMM.PCMM_API.get_patient_primary_care stored procedure
     *
     * @param patientICN
     * @param siteCode
     * @param stationNumber
     * @param [patientName]
     * @return JSON string of the stored procedure output variables
     */
    private String getPCMMTeamInfo(String patientICN, String siteCode, String stationNumber, String patientName) {
        Environment env = ksession.getEnvironment();
        EntityManagerFactory entityManagerFactory = (EntityManagerFactory) env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
        EntityManager em = entityManagerFactory.createEntityManager();
        Session session = em.unwrap(Session.class);

        String pcmmTeamInfo = session.doReturningWork(new ReturningWork<String>() {
            @Override
            public String execute(Connection connection) throws SQLException {
                String i_icn = patientICN;
                String i_site_code = (siteCode == null || siteCode.isEmpty()) ? null : siteCode;
                String i_station_number = (stationNumber == null || stationNumber.isEmpty()) ? null : stationNumber;

                String sqlQry = "call PCMM.PCMM_API.get_patient_primary_care(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                LOGGER.debug("PatientPcmmTeamInfoHandler.getPCMMTeamInfo sqlQry:" + sqlQry);

                try (CallableStatement callableStatement = connection.prepareCall(sqlQry)) {
                    callableStatement.setString(1, i_icn);
                    callableStatement.setString(2, i_site_code);
                    callableStatement.setString(3, i_station_number);
                    callableStatement.registerOutParameter(4, java.sql.Types.INTEGER);
                    callableStatement.registerOutParameter(5, java.sql.Types.VARCHAR);
                    callableStatement.registerOutParameter(6, java.sql.Types.VARCHAR);
                    callableStatement.registerOutParameter(7, java.sql.Types.VARCHAR);
                    callableStatement.registerOutParameter(8, java.sql.Types.VARCHAR);
                    callableStatement.registerOutParameter(9, java.sql.Types.VARCHAR);

                    callableStatement.execute();

                    Long o_team_id = callableStatement.getLong(4);
                    String o_team_name = callableStatement.getString(5);
                    String o_staff_last_name = callableStatement.getString(6);
                    String o_staff_first_name = callableStatement.getString(7);
                    String o_staff_middle_name = callableStatement.getString(8);
                    String o_staff_name = callableStatement.getString(9);

                    LOGGER.debug("Results received: " + o_team_id + " " + o_team_name + " " + o_staff_last_name + " " + o_staff_first_name + " " + o_staff_middle_name + " " + o_staff_name);

                    //format the response into a JSON object
                    JSONObject jsonObj = new JSONObject();
                    jsonObj.put("patientName", patientName);
                    jsonObj.put("teamId", o_team_id);
                    jsonObj.put("teamName", o_team_name);
                    jsonObj.put("pcpLastName", o_staff_last_name);
                    jsonObj.put("pcpFirstName", o_staff_first_name);
                    jsonObj.put("pcpMiddleName", o_staff_middle_name);
                    jsonObj.put("pcpName", o_staff_name);
                    String resultJson = jsonObj.toString();
                    return resultJson;
                } catch (SQLException e) {
                    LOGGER.error("PatientPcmmTeamInfoHandler.getPCMMTeamInfo", e);
                    return (ErrorResponseUtil.createJsonErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "PatientPcmmTeamInfoHandler.executeWorkItem: An unexpected condition has happened: ", e.getMessage()));
                }
            }
        });
        return pcmmTeamInfo;
    }

    @Override
    public void close() {
        // ignored
    }
}