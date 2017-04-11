package gov.va.jbpm.entities.util;

import java.util.ArrayList;
import java.util.List;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;
import gov.va.jbpm.exception.EventListenerException;
import gov.va.jbpm.utils.Logging;

public class ProcessRouteImplUtil {
	public static List<ProcessRouteImpl> create(long processInstanceId, String assignedTo) throws EventListenerException {
		Logging.debug("Entering ProcessRouteImplUtil.create");
		List<ProcessRouteImpl> processRouteImplList = new ArrayList<ProcessRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(assignedTo);
		
		for(BaseRoute baseRoute : baseRouteList) {
			ProcessRouteImpl processRouteImpl = new ProcessRouteImpl(processInstanceId, baseRoute);
			processRouteImplList.add(processRouteImpl);
		}
	
		return processRouteImplList;
	}
}