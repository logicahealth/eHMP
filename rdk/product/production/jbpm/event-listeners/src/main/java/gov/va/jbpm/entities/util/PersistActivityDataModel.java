package gov.va.jbpm.entities.util;

import java.sql.Clob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import org.jboss.logging.Logger;
import org.kie.api.event.process.ProcessEvent;
import org.kie.api.runtime.Environment;
import org.kie.api.runtime.EnvironmentName;
import gov.va.jbpm.eventlisteners.CustomProcessEventListener;

public class PersistActivityDataModel {

	private static final Logger LOGGER = Logger.getLogger(CustomProcessEventListener.class);

	public PersistActivityDataModel() {
	}
		
	public static void create(ProcessEvent event, String activityJSON) throws SQLException {

		LOGGER.debug("Entering PersistActivityDataModel.create - activityJSON=" + activityJSON);
		
		Environment env = event.getKieRuntime().getEnvironment();
		EntityManagerFactory entityManagerFactory = (EntityManagerFactory) env.get(EnvironmentName.ENTITY_MANAGER_FACTORY);
		EntityManager em = entityManagerFactory.createEntityManager();		
		em.joinTransaction();
		
		//get the processInstanceId
		Long processInstanceId = (long) event.getProcessInstance().getId();		
		
		//get the processDefinitionId
		String processDefinitionId = (String) event.getProcessInstance().getProcessId();
		
		//get the current connection and create the activityJSON CLOB object
		Session session = em.unwrap(Session.class);
	    session.doWork(new Work() {
            @Override
            public void execute(Connection connection) throws SQLException {
            	
            	String sqlQry = "call ACTIVITYDB.DATA_MODEL_API.save_data_model(?, ?, ?)";
            	try ( PreparedStatement pstmt = connection.prepareStatement(sqlQry) ) {
            		Clob activityJSONClob = connection.createClob();
            		activityJSONClob.setString(1, activityJSON);
            		pstmt.setLong(1, processInstanceId);
            		pstmt.setString(2, processDefinitionId);
            		pstmt.setClob(3, activityJSONClob);
            		pstmt.execute();
            	} catch (SQLException e) {
            		LOGGER.error("PersistActivityDataModel.create", e);
                }
            	                              
            }
	    });
	    LOGGER.debug("Exiting PersistActivityDataModel:");	
	}

}
