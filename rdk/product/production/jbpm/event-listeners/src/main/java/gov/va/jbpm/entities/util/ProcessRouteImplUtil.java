package gov.va.jbpm.entities.util;

import java.util.ArrayList;
import java.util.List;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;

public class ProcessRouteImplUtil {
	public static List<ProcessRouteImpl> create(long processInstanceId, String assignedTo) {
		
		List<ProcessRouteImpl> taskRouteImplList = new ArrayList<ProcessRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(assignedTo);
		for(BaseRoute baseRoute : baseRouteList) {
			taskRouteImplList.add(new ProcessRouteImpl(processInstanceId, baseRoute));
		}
	
		return taskRouteImplList;
	}
}