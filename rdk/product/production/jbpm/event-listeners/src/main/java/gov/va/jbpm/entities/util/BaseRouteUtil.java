package gov.va.jbpm.entities.util;

import java.util.ArrayList;
import java.util.List;

import org.jboss.logging.Logger;

import gov.va.jbpm.entities.impl.BaseRoute;
import gov.va.jbpm.exception.EventListenerException;

public class BaseRouteUtil {
	private static final Logger LOGGER = Logger.getLogger(BaseRouteUtil.class);
	public static List<BaseRoute> create(String routes) throws EventListenerException {
		LOGGER.debug("Entering BaseRouteUtil.create");
		
		List<BaseRoute> baseRouteList = new ArrayList<BaseRoute>();
		if (routes == null || routes.isEmpty()) {
			return baseRouteList;
		}
				
		String [] routesList = routes.split(",");
		for(String route : routesList) {
			route = route.trim();
			if (route.isEmpty()) {
				continue;
			}
			
			String facility = null;
			Integer team = null;
			Integer teamFocus = null;
			Integer teamType = null;
			Integer teamRole = null;
			String userId = null;
			String subRouteCode = null;
			boolean patientAssignment = false;			
			boolean isValid = false;
			
			if (route.startsWith("[")) {
				route = route.replace("[", "").replace("]", "");
				String [] subRoutes = route.split("/");
				
				for (String subRoute : subRoutes) {
					subRoute = subRoute.trim();
					//This is an example of the data in a subRoute: "[TF: Primary Care(11)/TR:Physician: (39)]"
					//The regular expression below matches:
					//  two ASCII letters, digits, or underscores followed by a colon
					//  anything which is not a left parenthesis followed by a left parenthesis
					//  any ASCII letters, digits, or underscores followed by a right parenthesis
					if (!subRoute.matches("\\w\\w:[^(]*\\(\\w+\\)")) {
						LOGGER.warn("Unable to match the following subRoute (ignoring it): " + subRoute);
						continue;
					}
					
					//subRoute is guaranteed of having more than 3 characters and having a ( and a ) because it matched the regular expression above.
					String category = subRoute.substring(0, 2);
					int subRouteCodeBegin = subRoute.indexOf('(');
					int subRouteCodeEnd = subRoute.indexOf(')');
					
					subRouteCode = subRoute.substring(subRouteCodeBegin + 1, subRouteCodeEnd);
					
					switch (category) {
						case "FC":
							facility = subRouteCode;
							isValid = true;
							break;
						case "TM":
							try {
								team = Integer.parseInt(subRouteCode);
							} catch (NumberFormatException e) {
								throw new EventListenerException("Category (team) was not an Integer: " + subRouteCode);
							}
							
							isValid = true;
							break;
						case "TF": 
							try {
								teamFocus = Integer.parseInt(subRouteCode);
							} catch (NumberFormatException e) {
								throw new EventListenerException("Category (teamFocus) was not an Integer: " + subRouteCode);
							}
							
							isValid = true;
							break;
						case "TT": 
							try {
								teamType = Integer.parseInt(subRouteCode);
							} catch (NumberFormatException e) {
								throw new EventListenerException("Category (teamType) was not an Integer: " + subRouteCode);
							}
							
							isValid = true;
							break;
						case "TR":
							try {
								teamRole = Integer.parseInt(subRouteCode);
							} catch (NumberFormatException e) {
								throw new EventListenerException("Category (teamRole) was not an Integer: " + subRouteCode);
							}
							
							isValid = true;
							break;
						case "PA":
							try {
								patientAssignment = Integer.parseInt(subRouteCode) == 1;
							} catch (NumberFormatException e) {
								throw new EventListenerException("Category (patientAssignment) was not an Integer: " + subRouteCode);
							}
							
							isValid = true;
							break;
					};
				}
			} else {
				isValid = true;
				userId = route;
			}
			
			if (isValid) {
				BaseRoute baseRoute = new BaseRoute(facility, team, teamFocus, teamType, teamRole, userId, patientAssignment);
				baseRouteList.add(baseRoute);
			}
		}
	
		return baseRouteList;
	}
}
