package gov.va.jbpm.entities.util;

import java.util.ArrayList;
import java.util.List;

import org.jboss.logging.Logger;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.entities.impl.ProcessRouteImpl;
import gov.va.jbpm.exception.EventListenerException;

public class ProcessRouteImplUtil {
	private static final Logger LOGGER = Logger.getLogger(ProcessRouteImplUtil.class);
	public static List<ProcessRouteImpl> create(long processInstanceId, String assignedTo) throws EventListenerException {
		LOGGER.debug("Entering ProcessRouteImplUtil.create");
		List<ProcessRouteImpl> processRouteImplList = new ArrayList<ProcessRouteImpl>();
				
		List<BaseRoute> baseRouteList = BaseRouteUtil.create(assignedTo);
		
		for(BaseRoute baseRoute : baseRouteList) {
			ProcessRouteImpl processRouteImpl = new ProcessRouteImpl(processInstanceId, baseRoute);
			processRouteImplList.add(processRouteImpl);
		}
	
		return processRouteImplList;
	}
}