/*
 * COPYRIGHT STATUS: © 2015.  This work, authored by Cognitive Medical Systems
 * employees, was funded in whole or in part by The Department of Veterans
 * Affairs under U.S. Government contract VA118-11-D-1011 / VA118-1011-0013.
 * The copyright holder agrees to post or allow the Government to post all or
 * part of this work in open-source repositories subject to the Apache License,
 * Version 2.0, dated January 2004. All other rights are reserved by the
 * copyright owner.
 *
 * For use outside the Government, the following notice applies:
 *
 *     Copyright 2015 © Cognitive Medical Systems
 *
 *     Licensed under the Apache License, Version 2.0 (the "License"); you may
 *     not use this file except in compliance with the License. You may obtain
 *     a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
package com.cognitive.cds.invocation.engineplugins;

import com.cognitive.cds.invocation.EngineInstanceStateManagementIFace;
import com.cognitive.cds.invocation.model.EngineInstanceState;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Component;

/**
 *
 * @author jeremy
 */
@Component
public class OpenCDSMockEngineInstanceStateManager implements EngineInstanceStateManagementIFace {

	private ArrayList<EngineInstanceState> openCDSEngines = new ArrayList<>();

	@Override
	public List<EngineInstanceState> getActiveEngineInstancesByType(String type) {

		ArrayList<EngineInstanceState> toReturn = new ArrayList<EngineInstanceState>();

		for (EngineInstanceState eis : openCDSEngines) {
			//return only active matches...
			if (eis.getType().equalsIgnoreCase(type) && eis.getStatus() == true) {
				toReturn.add(eis);
			}
		}
		System.out.println("total eis records: " + openCDSEngines.size()
			+ " - active eis records: " + toReturn.size());

		return toReturn;

	}

	@PostConstruct
	private void init() {

		/**
		 * preloading this with both good and bad records, so that the code can fail on one engine, mark it as
		 * 'inactive' and then try again, etc.
		 */
		EngineInstanceState openCDS1 = new EngineInstanceState();
		openCDS1.setName("OpenCDS One");
		openCDS1.setType("OpenCDS");
		openCDS1.setId("oicu812");
		openCDS1.setStatus(true);
		openCDS1.setHost("IPADDRESS");
		openCDS1.setPort("8080");

		openCDSEngines.add(openCDS1);

		EngineInstanceState openCDS2 = new EngineInstanceState();
		openCDS2.setName("OpenCDS Two");
		openCDS2.setType("OpenCDS");
		openCDS2.setId("c3p0");
		openCDS2.setStatus(true);
		openCDS2.setHost("IP__ADDRESS"); //obviously a bad one...
		openCDS2.setPort("8080");

		openCDSEngines.add(openCDS2);
	}

	@Override
	public boolean updateEngineInstanceState(EngineInstanceState ueis) {

		for (EngineInstanceState eis : openCDSEngines) {
			if (eis.getName().equalsIgnoreCase(ueis.getName())
				&& eis.getType().equalsIgnoreCase(ueis.getType())
				&& eis.getHost().equalsIgnoreCase(ueis.getHost())
				&& eis.getPort().equalsIgnoreCase(ueis.getPort())) {
				eis.setStatus(false);
			}
		}
		return true;
	}

}
