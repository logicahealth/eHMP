package gov.va.jbpm.eventlisteners;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Date;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public class DataAccessUtil {
    
	/*
	 * Create new Process Instance record with given parameters.
	 * */
	public  static int createProcessInstanceRecord (long processInstanceId,
			String patientIcn,
			String facilityId,
			String processName,
			String processDefinitionId,
			String deploymentId,
			int statusId,
			String createdById,
			String version,
		    long parentInstanceId,
		    String instanceName,
		    String state,
		    Date stateDueDate,
		    int urgency
			
			) {
				 
		 Connection conn = null;
		
		 try{
			 
			conn = createConnection();
		    
		    String sql = "call Am_CreateProcessInstance(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, processInstanceId);
		    cs.setString(2, patientIcn);
		    cs.setString(3, facilityId);
		    cs.setString(4, processName);
		    cs.setString(5, processDefinitionId);
		    cs.setString(6, deploymentId);
		    cs.setInt(7, statusId);
		    cs.setString(8, createdById);		    
		    cs.setString(9, version);
		    if (parentInstanceId == -1) {
			    cs.setNull(10, java.sql.Types.BIGINT);		    	
		    }
		    else {
			    cs.setLong(10, parentInstanceId);		    	
		    }
		    cs.setString(11, instanceName);		    
		    cs.setString(12, state);		    
		    if (stateDueDate == null){
		    	cs.setNull(13, java.sql.Types.TIMESTAMP);
		    }
		    else{
		    	cs.setObject(13, new java.sql.Timestamp(stateDueDate.getTime()));
		    }
		    
		    if (urgency == -1) {
		    	cs.setNull(14, java.sql.Types.INTEGER);
		    }
		    else {
		    	cs.setInt(14, urgency);
		    }
		    
		    return cs.executeUpdate();

		 }catch(SQLException se){
		    se.printStackTrace();
		 }catch(Exception e){
		    e.printStackTrace();
		 }finally{
		    try{
		       if(conn!=null)
		          conn.close();
		    }catch(SQLException se){
		       se.printStackTrace();
		    }
		 }
		 
		 return 0;
	}

	/*
	 * Update process instance status
	 * */
	public  static int updateProcessInstanceStatus (long processInstanceId,
			int newStatusId) {
				 
		 Connection conn = null;
		
		 try{
			 
			conn = createConnection();
		    
			String sql = "call Am_UpdateProcessInstanceStatus(?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, processInstanceId);
		    cs.setInt(2, newStatusId);
		    return cs.executeUpdate();

		 } catch(SQLException se) {
		    se.printStackTrace();
		 } catch(Exception e) {
		    e.printStackTrace();
		 } finally {
		    try {
		       if (conn!=null)
		          conn.close();
		    } catch (SQLException se){
		       se.printStackTrace();
		    }
		 }
		 
		 return 0;
	}

	/*
	 * Update process instance state
	 * */
	public  static int updateProcessInstanceState (long processInstanceId,
			String newState) {
				 
		 Connection conn = null;
		
		 try{
			 
			conn = createConnection();
		    
			String sql = "call Am_UpdateProcessInstanceState(?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, processInstanceId);
		    cs.setString(2, newState);
		    return cs.executeUpdate();

		 } catch(SQLException se) {
		    se.printStackTrace();
		 } catch(Exception e) {
		    e.printStackTrace();
		 } finally {
		    try {
		       if (conn!=null)
		          conn.close();
		    } catch (SQLException se){
		       se.printStackTrace();
		    }
		 }
		 
		 return 0;
	}

	/*
	 * Update process instance state due date
	 * */
	public  static int updateProcessInstanceStateDueDate (long processInstanceId,
			Date stateNewDueDate) {
				 
		 Connection conn = null;
		
		 try{
			 
			conn = createConnection();
		    
			String sql = "call Am_UpdateProcInsStateDueDate(?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, processInstanceId);
		    if (stateNewDueDate == null){
		    	cs.setNull(2, java.sql.Types.TIMESTAMP);
		    }
		    else{
		    	cs.setObject(2, new java.sql.Timestamp(stateNewDueDate.getTime()));
		    }
		    return cs.executeUpdate();

		 } catch(SQLException se) {
		    se.printStackTrace();
		 } catch(Exception e) {
		    e.printStackTrace();
		 } finally {
		    try {
		       if (conn!=null)
		          conn.close();
		    } catch (SQLException se){
		       se.printStackTrace();
		    }
		 }
		 
		 return 0;
	}

	/*
	 * Creates new task instance record
	 * */
	public static int createTaskInstanceRecord (long taskInstanceId,
			long processInstanceId,
			String taskName,
			String description,
			int statusId,
			String actualOwner,
			Date dueDate,
			int priority,
			boolean isSkippable,
			String routes) {
		 Connection conn = null;
			
		 try{
			 
			conn = createConnection();
		    
//			Parameters to the procedure
//				taskInstanceId INT,
//				processInstanceId INT, 
//				taskName varchar2,
//			    description varchar2,
//			    statusId int,
//			    actualOwner varchar2,
//			    dueDate date
//		    	priority int
//		    	skippable boolean
//		    	routes varchar2
			
		    String sql = "call Am_CreateTaskInstance(?,?,?,?,?,?,?,?,?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, taskInstanceId);
		    cs.setLong(2, processInstanceId);
		    cs.setString(3, taskName);
		    cs.setString(4, description);
		    cs.setInt(5, statusId);
		    cs.setString(6, actualOwner);
		    
		    if (dueDate == null){
		    	cs.setNull(7, java.sql.Types.TIMESTAMP);
		    }
		    else{
		    	cs.setObject(7, new java.sql.Timestamp(dueDate.getTime()));
		    }

		    cs.setInt(8, priority);
		    cs.setInt(9, isSkippable?1:0);
		    cs.setString(10, routes);
		    
		    return cs.executeUpdate();

		 } catch (SQLException se) {
		    se.printStackTrace();
		 } catch (Exception e) {
		    e.printStackTrace();
		 } finally {
		    try {
		       if (conn!=null)
		          conn.close();
		    } catch (SQLException se) {
		       se.printStackTrace();
		    }
		 }
		
		return 0;
	}

	/*
	 * Updates task instance record
	 * */
	public static int updateTaskInstanceRecord (long taskInstanceId,
			int newStatusId,
			String newOwner) {
		 Connection conn = null;
			
		 try{
			 
			conn = createConnection();
		    
//			Parameters to the procedure
//				taskInstanceId INT,
//			    newStatusId int(11),
//			    newOwner varchar(255),
			
		    String sql = "call Am_UpdateTaskInstanceStatus(?,?,?)";
		    
		    CallableStatement cs = conn.prepareCall (sql);

		    cs.setLong(1, taskInstanceId);
		    cs.setInt(2, newStatusId);
		    cs.setString(3, newOwner);
		    		    
		    return cs.executeUpdate();

		 } catch (SQLException se) {
		    se.printStackTrace();
		 } catch (Exception e) {
		    e.printStackTrace();
		 } finally {
		    try {
		       if (conn!=null)
		          conn.close();
		    } catch (SQLException se) {
		       se.printStackTrace();
		    }
		 }
		
		return 0;
	}
	
	/*
	 * create connection to database server
	 * */
	private static Connection createConnection () throws ClassNotFoundException, SQLException, NamingException, Exception {
		
		InitialContext cxt = new InitialContext();
		DataSource ds = (DataSource)cxt.lookup("java:jboss/datasources/activityDbDS");
		if (ds == null) {
			throw new Exception ("Data source 'activityDbDS' not found...");
		}

		return ds.getConnection();
	}
}
