package gov.va.jbpm.entities.util;


import java.util.ArrayList;
import java.util.List;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.TaskRouteImpl;

public class TaskRouteImplUtil {

	public static List<TaskRouteImpl> create(long taskInstanceId, String routes) {
		
		List<TaskRouteImpl> taskRouteImplList = new ArrayList<TaskRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(routes);
		for(BaseRoute baseRoute : baseRouteList) {
			taskRouteImplList.add(new TaskRouteImpl(taskInstanceId, baseRoute));
		}
	
		return taskRouteImplList;
	}
}
