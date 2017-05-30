package gov.va.jbpm.entities.util;


import java.util.ArrayList;
import java.util.List;

import org.jboss.logging.Logger;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.TaskRouteImpl;
import gov.va.jbpm.exception.EventListenerException;

public class TaskRouteImplUtil {
	private static final Logger LOGGER = Logger.getLogger(TaskRouteImplUtil.class);
	public static List<TaskRouteImpl> create(long taskInstanceId, String routes) throws EventListenerException {
		LOGGER.debug("Entering TaskRouteImplUtil.create");
		
		List<TaskRouteImpl> taskRouteImplList = new ArrayList<TaskRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(routes);
		
		for(BaseRoute baseRoute : baseRouteList) {
			TaskRouteImpl taskRouteImpl = new TaskRouteImpl(taskInstanceId, baseRoute);
			taskRouteImplList.add(taskRouteImpl);
		}
	
		return taskRouteImplList;
	}
}
