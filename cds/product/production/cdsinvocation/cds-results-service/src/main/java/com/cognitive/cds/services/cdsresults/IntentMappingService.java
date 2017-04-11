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
package com.cognitive.cds.services.cdsresults;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.bson.Document;

import com.cognitive.cds.invocation.model.IntentMapping;
import com.cognitive.cds.invocation.model.InvocationMapping;
import com.cognitive.cds.invocation.model.Rule;
import com.cognitive.cds.invocation.mongo.IntentMappingDao;
import com.cognitive.cds.services.cdsresults.model.Info;
import com.cognitive.cds.services.cdsresults.model.Status;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.mongodb.client.result.DeleteResult;

/**
 * @author Tadesse Sefer
 * @version 1.0
 * @created 21-Sep-2015 9:10:43 AM
 */
public class IntentMappingService implements IntentMappingInterface {

	private static IntentMappingDao intentLookup;

	public IntentMappingService() {
	}

	@Override
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	@Path("/")
	public Response create(IntentMapping request, MessageContext context) {
		String id = "";
		Status status = new Status();
		validateIntentMapping(request, status);
		if (status.getInfo() != null && !status.getInfo().isEmpty()) {
			return Response.status(400).entity(status).build();
		}
		try {
			if (checkExistingIntent(request.getName(), status)) {
				return Response.status(200).entity(status).build();
			}
			id = intentLookup.createIntent(request);
			request.setId(id);
		} catch (JsonProcessingException e) {
			buildStatusMessage(status, e.getMessage());
			return Response.status(500).entity(status).build();
		}
		return Response.status(200).entity(request).build();
	}

	@Override
	@PUT
	@Consumes("application/json")
	@Produces("application/json")
	@Path("/")
	public Response update(IntentMapping request, MessageContext context) {
		Status status = new Status();
		if (request.get_id() == null) {
			buildStatusMessage(status, " _id property should be provided for update");
			Response.status(200).entity(status).build();
		}
		validateIntentMapping(request, status);
		if (status.getInfo() != null && !status.getInfo().isEmpty()) {
			return Response.status(200).entity(status).build();
		}
		try {
			Document result = intentLookup.updateIntentMapping(request);
			if (result != null) {
				buildStatusMessage(status, request.getName() + " intent updated");
			} else {
				buildStatusMessage(status, request.getName() + " intent doen't exist");
			}
		} catch (JsonProcessingException e) {
			buildStatusMessage(status, e.getMessage());
		}
		return Response.status(200).entity(status).build();
	}

	@Override
	@DELETE
	@Produces("application/json")
	@Path("/{intentName}")
	public Response delete(@PathParam("intentName") String intentName) {
		Status status = new Status();
		DeleteResult result = intentLookup.deleteIntent(intentName);
		if (result != null) {
			if (result.getDeletedCount() == 0) {
				buildStatusMessage(status, intentName + " intent doesn't exist");
			} else {
				buildStatusMessage(status, intentName + " intent deleted");
			}
		}
		return Response.status(200).entity(status).build();
	}

	@Override
	@GET
	@Produces("application/json")
	@Path("/{intentName}")
	public Response getIntent(@PathParam("intentName") String intentName) {

		IntentMapping im = intentLookup.getIntent(intentName);
		if (im != null) {
			im.set_id(null); // the value is mili seconds and it's not usefull
								// as json value
			return Response.status(200).entity(im).build();
		} else {
			Status status = new Status();
			buildStatusMessage(status, "Intent doesn't exist");
			return Response.status(200).entity(status).build();
		}
	}

	@Override
	@GET
	@Produces("application/json")
	@Path("/")
	public Response getAll() {

		List<IntentMapping> intents = intentLookup.getAll();
		if (intents != null) {
			return Response.status(200).entity(intents).build();
		} else {
			Status status = new Status();
			buildStatusMessage(status, "There are no intents.");
			return Response.status(200).entity(status).build();
		}
	}

	public static IntentMappingDao getIntentLookup() {
		return intentLookup;
	}

	public static void setIntentLookup(IntentMappingDao intentLookup) {
		IntentMappingService.intentLookup = intentLookup;
	}

	private void buildStatusMessage(Status status, String e) {
		if (status.getInfo() == null) {
			List<Info> infoList = new ArrayList<>();
			status.setInfo(infoList);
		}
		Info info = new Info();
		info.setText(e);
		status.getInfo().add(info);
	}

	private boolean checkExistingIntent(String intentName, Status status) {
		List<Info> infoList = new ArrayList<>();
		status.setInfo(infoList);
		Info info = new Info();
		if (intentName == null || intentName.isEmpty()) {
			info.setText("Intent name can not be empty");
			status.getInfo().add(info);
			return true;
		} else {
			IntentMapping im = intentLookup.getIntent(intentName);
			if (im != null) {
				info.setText("There is an exiting intent with name : " + intentName);
				status.getInfo().add(info);
				return true;
			}
		}
		return false;
	}

	private void validateIntentMapping(IntentMapping im, Status status) {
		if (im.getName() == null || im.getName().isEmpty()) {
			buildStatusMessage(status, "Intent name should be provided.");
		}
		if (im.getInvocations() == null || im.getInvocations().isEmpty()) {
			buildStatusMessage(status, "At least one invocation mapping that has rules should be provided.");
		} else {
			for (InvocationMapping invocationMapping : im.getInvocations()) {
				if (invocationMapping.getEngineName() == null || invocationMapping.getEngineName().isEmpty()) {
					buildStatusMessage(status, "At least one invocation engine name should be provided.");
				}
				if (invocationMapping.getRules() == null || invocationMapping.getRules().isEmpty()) {
					buildStatusMessage(status, "At least one rules mapping should be provided.");
				} else {
					validateRule(invocationMapping, status);
				}
			}
		}
	}

	private void validateRule(InvocationMapping invocationMapping, Status status) {
		List<Rule> rules = invocationMapping.getRules();
		for (Rule rule : rules) {
			if (rule.getProperties() == null || rule.getProperties().isEmpty()) {
				buildStatusMessage(status, "Rules properties should be provided.");
			} else {
				Properties prop = rule.getProperties();
				if (prop.getProperty("scopingEntityId") == null || prop.getProperty("scopingEntityId").isEmpty()) {
					buildStatusMessage(status, "Rules property scopingEntityId should be provided.");
				} else if (prop.getProperty("businessId") == null || prop.getProperty("businessId").isEmpty()) {
					buildStatusMessage(status, "Rules property businessId should be provided.");
				} else if (prop.getProperty("version") == null || prop.getProperty("version").isEmpty()) {
					buildStatusMessage(status, "Rules property version should be provided.");
				}
			}
		}
	}
}
