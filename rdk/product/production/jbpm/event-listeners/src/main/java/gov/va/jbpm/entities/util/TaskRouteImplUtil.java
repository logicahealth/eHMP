package gov.va.jbpm.entities.util;


import java.util.ArrayList;
import java.util.List;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.TaskRouteImpl;
import gov.va.jbpm.exception.EventListenerException;
import gov.va.jbpm.utils.Logging;

public class TaskRouteImplUtil {

	public static List<TaskRouteImpl> create(long taskInstanceId, String routes) throws EventListenerException {
		Logging.debug("Entering TaskRouteImplUtil.create");
		
		List<TaskRouteImpl> taskRouteImplList = new ArrayList<TaskRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(routes);
		
		for(BaseRoute baseRoute : baseRouteList) {
			TaskRouteImpl taskRouteImpl = new TaskRouteImpl(taskInstanceId, baseRoute);
			taskRouteImplList.add(taskRouteImpl);
		}
	
		return taskRouteImplList;
	}
}
