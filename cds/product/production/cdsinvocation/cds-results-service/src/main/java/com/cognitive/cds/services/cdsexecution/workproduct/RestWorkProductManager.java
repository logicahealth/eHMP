/*
 * COPYRIGHT STATUS: © 2015, 2016.  This work, authored by Cognitive Medical Systems
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

package com.cognitive.cds.services.cdsexecution.workproduct;
import java.io.IOException;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.cognitive.cds.invocation.fhir.JsonProviderCDS;
import com.cognitive.cds.invocation.workproduct.model.WorkProduct;
import com.cognitive.cds.invocation.workproduct.model.WorkProductAssignment;
import com.cognitive.cds.services.cdsexecution.WorkProductWrapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

public class RestWorkProductManager implements WorkProductManagementIFace {


	
	
	private String serverURL;
	private static final Logger logger = LoggerFactory.getLogger(RestWorkProductManager.class);
	private static final String WP_ASSIGNMENT_PATH = "assignment";
	
	@Override
	public boolean assignWorkProduct(WorkProductAssignment wpa, boolean override) {

		try {
			logger.info("Making assingmengt "+wpa.toJsonString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		Client client1 = ClientBuilder.newClient();
		// Make sure we are using Jackson
		//JacksonJsonProvider provider = new JacksonJsonProvider();
		//client1.register(provider);
		JsonProviderCDS  cdsJsonProvider = new JsonProviderCDS();
        cdsJsonProvider.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        client1.register(cdsJsonProvider);
		String path = serverURL+wpa.getWorkProductId()+"/"+WP_ASSIGNMENT_PATH;
		logger.info("WP Assignment URL = "+path);

		Response respObject = null;
        try {
            respObject = client1.target(path).request("application/json")
            		.post(Entity.entity(wpa, MediaType.APPLICATION_JSON), Response.class);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

		//Response respObject  = client1.target(serverURL).path(wpa.getWorkProductId()).path(WP_ASSIGNMENT_PATH).request("application/json")
		//		.post(Entity.entity(wpa, MediaType.APPLICATION_JSON), Response.class);
		
		
		boolean out = true;
		if (respObject.getStatusInfo().getFamily()!=Response.Status.Family.SUCCESSFUL) {
			logger.error("Assignment failed, http code = "+respObject.getStatus()+", "+respObject.getLocation());	
			out = false;
		}
		else {
			String outs  = respObject.readEntity(String.class);
			logger.info("Assignment result = "+outs);
		
		}
		return out;
	}

	@Override
	public String storeWorkProduct(WorkProduct wp) {

		try {
			logger.info("Saving Work Product "+ wp.toJsonString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		String id=null;
		Client client1 = ClientBuilder.newClient();
		//JacksonJsonProvider provider = new JacksonJsonProvider();
		JsonProviderCDS  cdsJsonProvider = new JsonProviderCDS();
		cdsJsonProvider.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		client1.register(cdsJsonProvider);
		//We use this to avoid errors with embedded payload - We need to examine serialization of work product in greater detail.
        // provider.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true); //2.1.4 fasterxml version
      
		Response respObject = null;
	    try {
            respObject = client1.target(serverURL).request("application/json")
            		.post(Entity.entity(wp, MediaType.APPLICATION_JSON), Response.class);
        } catch (Exception e) { 
            logger.error(e.getMessage());
        }
		
		if (respObject.getStatusInfo().getFamily()!=Response.Status.Family.SUCCESSFUL){
			logger.error("Failed to store work product http code = " + respObject.getStatus());			
		}
		else {
			WorkProductWrapper out= respObject.readEntity(WorkProductWrapper.class);
			//String out  = respObject.readEntity(String.class);
			//logger.info(out);
			id = out.getData().get(0).getId();
			logger.debug("Work product stored, Id = "+id);
			wp.setId(id);
		}
		return id;
	}

	/**
	 * @return the serverURL
	 */
	public String getServerURL() {
		return serverURL;
	}

	/**
	 * @param serverURL
	 *            the serverURL to set
	 */
	public void setServerURL(String serverURL) {
		if (!serverURL.endsWith("/"))
		{
			serverURL=serverURL+"/";
		}
		this.serverURL = serverURL;
	}
	
	
}
