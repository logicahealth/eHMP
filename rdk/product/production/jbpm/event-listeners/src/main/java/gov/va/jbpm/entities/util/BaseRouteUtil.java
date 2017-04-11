package gov.va.jbpm.entities.util;

import java.util.ArrayList;
import java.util.List;

import gov.va.jbpm.entities.impl.BaseRoute;

public class BaseRouteUtil {
	public static List<BaseRoute> create(String routes) {
		
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
						System.err.println("Unable to match the following subRoute (ignoring it): " + subRoute);
						continue;
					}
					
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
						team = Integer.parseInt(subRouteCode);
						isValid = true;
						break;
					case "TF": 
						teamFocus = Integer.parseInt(subRouteCode);
						isValid = true;
						break;
					case "TT": 
						teamType = Integer.parseInt(subRouteCode);
						isValid = true;
						break;
					case "TR":
						teamRole = Integer.parseInt(subRouteCode);
						isValid = true;
						break;
					case "PA":
						patientAssignment = Integer.parseInt(subRouteCode) == 1;
						isValid = true;
						break;
					};
				}
			} else {
				isValid = true;
				userId = route;
			}
			
			if (isValid) {
				baseRouteList.add(new BaseRoute(facility, team, teamFocus, teamType,
						teamRole, userId, patientAssignment));
			}

		}
	
		return baseRouteList;
	}

}
